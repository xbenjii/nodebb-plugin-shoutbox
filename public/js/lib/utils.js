define(function() {
	var sb, shoutTpl, textTpl;

	var Utils = {
		init: function(callback) {
			window.ajaxify.loadTemplate('shoutbox/shout', function(shout) {
				window.ajaxify.loadTemplate('shoutbox/shout/text', function(text) {
					shoutTpl = shout;
					textTpl = text;
					callback();
				});
			});
		},
		parseShout: function(shout, onlyText) {
			var tpl = onlyText ? textTpl : shoutTpl;
			shout.user.hasRights = shout.fromuid === app.uid || app.isAdmin === true;
			shout.user.timestamp = new Date(parseInt(shout.timestamp)).toISOString();
			return window.templates.parse(tpl, shout);
		},
		prepareShoutbox: function() {
			Utils.getSettings(function() {
				var shoutBox = sb.base.getShoutPanel();
				//if (shoutBox.length > 0 && Config.settings.hide !== 1) {
				//	shoutBox.parents('.shoutbox-row').removeClass('hide');
				if (shoutBox.length > 0) {
					Utils.parseSettings(shoutBox);
					Utils.registerHandlers(shoutBox);
					sb.base.getShouts(shoutBox);
				}
			});
		},
		getSettings: function(callback) {
			socket.emit(sb.config.sockets.getSettings, function(err, settings) {
				sb.config.settings = settings.settings;
				sb.config.vars.shoutLimit = settings.shoutLimit;
				if(callback) {
					callback();
				}
			});
		},
		parseSettings: function(shoutBox) {
			var settings = sb.config.settings;
			if (!settings) {
				return;
			}
			for(var key in settings) {
				if (settings.hasOwnProperty(key)) {
					var value = settings[key];
					var el = shoutBox.find('#shoutbox-settings-' + key + ' span');
					if (value === 1) {
						el.removeClass('fa-times').addClass('fa-check');
					} else {
						el.removeClass('fa-check').addClass('fa-times');
					}
				}
			}
		},
		registerHandlers: function(shoutBox) {
			Utils.addActionHandlers(shoutBox);
			Utils.addSocketHandlers();
		},
		addActionHandlers: function(shoutBox) {
			var actions = sb.actions;
			for (var a in actions) {
				if (actions.hasOwnProperty(a)) {
					actions[a].register(shoutBox);
				}
			}
		},
		addSocketHandlers: function() {
			var sockets = sb.sockets;
			for (var s in sockets) {
				if (sockets.hasOwnProperty(s)) {
					sockets[s].register();
				}
			}
		},
		checkAnon: function(callback) {
			if (app.uid === 0) {
				return callback(true);
			}
			return callback(false);
		},
		showEmptyMessage: function(shoutBox) {
			shoutBox.find('#shoutbox-content').html(Config.messages.empty);
		}
	};

	return function(Shoutbox) {
		Shoutbox.utils = Utils;
		sb = Shoutbox;
	};
});

