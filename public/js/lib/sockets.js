define(function() {
	var sb;
	var Sockets = {
		onreceive: {
			register: function() {
				if (socket.listeners(sb.config.sockets.onReceive).length === 0) {
					socket.on(sb.config.sockets.onReceive, this.handle);
				}
			},
			handle: function(data) {
				var shoutBox = sb.base.getShoutPanel();
				if (shoutBox.length > 0) {
					data.user.timestamp = new Date().toISOString();
                    sb.base.addShout(shoutBox, data);
                    app.processPage();
					if (data.fromuid !== app.uid) {
						if (sb.config.getSetting('notification') === 1) {
							app.alternatingTitle(sb.config.messages.alert.replace(/%u/g, data.user.username));
						}
						if (sb.config.getSetting('sound') === 1) {
							$('#shoutbox-sounds-notification')[0].play();
						}
					}
				}
			}
		},
		ondelete: {
			register: function() {
				if (socket.listeners(sb.config.sockets.onDelete).length === 0) {
					socket.on(sb.config.sockets.onDelete, this.handle);
				}
			},
			handle: function(data) {
				var par = $('[data-sid="' + data.sid + '"]').parents('[data-uid]');
				if (par.find('[data-sid]').length === 1) {
					par.remove();
				} else {
					$('[data-sid="' + data.sid + '"]').remove();
				}
				if (data.sid === sb.actions.edit.editing) {
					sb.actions.edit.finish(sb.base.getShoutPanel());
				}
			}
		},
		onedit: {
			register: function() {
				if (socket.listeners(sb.config.sockets.onEdit).length === 0) {
					socket.on(sb.config.sockets.onEdit, this.handle);
				}
			},
			handle: function(data) {
				data.content = $(data.content).wrapInner('<abbr title="edited"></abbr>').html();
				$('[data-sid="' + data.sid + '"]').html(sb.utils.parseShout(data, true));
			}
		},
		onstatuschange: {
			register: function() {
				if (socket.listeners(sb.config.sockets.getUserStatus).length === 0) {
					socket.on(sb.config.sockets.getUserStatus, this.handle);
				}
			},
			handle: function(err, data) {
				sb.base.updateUserStatus(sb.base.getShoutPanel(), data.uid, data.status);
			}
		}
	};

	return function(Shoutbox) {
		Shoutbox.sockets = Sockets;
		sb = Shoutbox;
	};
});