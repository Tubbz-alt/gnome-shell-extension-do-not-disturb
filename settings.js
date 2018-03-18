const Gio = imports.gi.Gio;
const Lang = imports.lang;
const GLib = imports.gi.GLib;
const Me = imports.misc.extensionUtils.getCurrentExtension();

/**
 * A class which handles all interactions with the settings.
 */
var SettingsManager = new Lang.Class({
	Name: 'SettingsManager',

	/**
	 * Represents a settings repository, where settings can be modified and read.
	 * @constructor
	 */
	_init(){
		this._appSettings = _getSettings();
		this._notificationSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.notifications'});
	},

	/**
	 * Enable or disable do not disturb mode.
	 * 
	 * @param  {boolean} enabled - True if do not disturb should be enabled, false otherwise.
	 */
	setDoNotDisturb(enabled){
		this._notificationSettings.set_boolean('show-banners', !enabled);
	},

	/**
	 * Determines if do not disturb is enabled or not.
	 * 
	 * @returns {boolean} - True if do not disturb is enabled, false otherwise.
	 */
	isDoNotDisturb(){
		return !this._notificationSettings.get_boolean('show-banners');
	},

	/**
	 * Calls a function when the status of the do not disturb setting has changed.
	 * 
	 * @param {() => ()} fn - The function to call when the do not disturb setting is changed.
	 */
	onDoNotDisturbChanged(fn){
		this._notificationSettings.connect('changed::show-banners', fn);
	},

	/**
	 * Enable or disable the icon in the system panel when do not disturb mode is enabled.
	 * 
	 * @param  {boolean} showIcon - True if the icon should be shown, false otherwise.
	 */
	setShowIcon(showIcon){
		this._appSettings.set_boolean('show-icon', showIcon);
	},

	/**
	 * Determines if the icon should be shown or not.
	 * 
	 * @returns {boolean} - True if the icon should be shown when do not disturb is enabled, false otherwise.
	 */
	shouldShowIcon(){
		return this._appSettings.get_boolean('show-icon');
	},

	/**
	 * Calls a function when the status of the show icon setting has changed.
	 * 
	 * @param {() => ()} fn - The function to call when the show icon setting is changed.
	 */
	onShowIconChanged(fn){
		this._appSettings.connect('changed::show-icon', fn);
	},
});

/**
 * A helper function to get the application specific settings. Adapted
 * from the System76 Pop Suspend Button extension: https://github.com/pop-os/gnome-shell-extension-pop-suspend-button
 * 
 * @returns {Gio.Settings} - The application specific settings object.
 */
function _getSettings() {
    let schemaName = 'org.gnome.shell.extensions.kylecorry31-do-not-disturb';
    let schemaDir = Me.dir.get_child('schemas').get_path();

    // Extension installed in .local
    if (GLib.file_test(schemaDir + '/gschemas.compiled', GLib.FileTest.EXISTS)) {
        let schemaSource = Gio.SettingsSchemaSource.new_from_directory(schemaDir,
                                  Gio.SettingsSchemaSource.get_default(),
                                  false);
        let schema = schemaSource.lookup(schemaName, false);

        return new Gio.Settings({ settings_schema: schema });
    }
    // Extension installed system-wide
    else {
        if (Gio.Settings.list_schemas().indexOf(schemaName) == -1)
            throw "Schema \"%s\" not found.".format(schemaName);
        return new Gio.Settings({ schema: schemaName });
    }
}