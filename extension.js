// ~/.local/share/gnome-shell/extensions/snowy-toggle@you/extension.js
import St from 'gi://St';
import GLib from 'gi://GLib';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

const SnowyUUID = 'snowy@exposedcat';

export default class SnowyToggleExtension extends Extension {
    enable() {
        this._indicator = new PanelMenu.Button(0.0, `${this.metadata.name} Indicator`);

        this._icon = new St.Icon({
            icon_name: 'weather-snow-symbolic',
            style_class: 'system-status-icon'
        });
        this._indicator.add_child(this._icon);

        this._indicator.connect('button-press-event', () => this._toggleSnowy());

        // Listen for extension state changes
        this._signalId = Main.extensionManager.connect('extension-state-changed',
            (_manager, ext) => {
                if (ext.uuid === SnowyUUID) this._updateIcon();
            });

        // Initial state
        this._updateIcon();

        // Add to right side of top bar
        Main.panel.addToStatusArea(this.uuid, this._indicator, 0, 'right');
    }

    disable() {
        if (this._signalId) {
            Main.extensionManager.disconnect(this._signalId);
            this._signalId = null;
        }
        this._indicator?.destroy();
        this._indicator = null;
    }

    _toggleSnowy() {
        const enabled = Main.extensionManager.lookup(SnowyUUID)?.state === 1;
        const cmd = enabled
            ? `gnome-extensions disable ${SnowyUUID}`
            : `gnome-extensions enable ${SnowyUUID}`;
        GLib.spawn_command_line_async(cmd);
    }

    _updateIcon() {
        const enabled = Main.extensionManager.lookup(SnowyUUID)?.state === 1;
        this._icon.opacity = enabled ? 255 : 100;
    }
}
