define(['jquery','./view','strophe'],
	function($,view, strophe) {
		var chat = {};
		chat.peers = {};
		chat.localStream = null;

		$(document).bind('callincoming.jingle', function(event, sid) {
			var sess = self.connection.jingle.sessions[sid];
			sess.sendAnswer();
			sess.accept();
		});

		$(document).bind('callactive.jingle', function(event, video, sid) {
			view.appendVideo(video);
		});

		$(document).bind('callterminated.jingle', function(event, sid, reason) {
			view.removeVideo(sid);
		});

		$(document).bind('iceconnectionstatechange.jingle', function(event, sid, sess) {
			if (sess.peerconnection.signalingState == 'stable' && (sess.peerconnection.iceConnectionState == 'connected' || sess.peerconnection.iceConnectionState == 'completed')) {
				var nickname = atob(sess.peerjid.split("/")[1].split("___")[0]);
				var el = view.createVideo(nickname,sid);
				$(document).trigger('callactive.jingle', [el, sid]);
				RTC.attachMediaStream($(el), sess.remoteStream);
			}
			if(sess.peerconnection.iceConnectionState == 'disconnected' || sess.peerconnection.iceConnectionState == 'closed'){
				view.removeVideo(sid);
				return;
			}
		});

		$(window).bind('beforeunload', function() {
			chat.disconnect();
		});

		chat.connect = function(user,room){
			var connection = chat.connection = new strophe.Connection('https://chat.freakynois.es/http-bind/');
			if (false) {
				connection.rawInput = function(data) { console.log('RECV: ' + data); };
				connection.rawOutput = function(data) { console.log('SEND: ' + data); };
			}
			connection.jingle.pc_constraints = RTC.pc_constraints;
			connection.jingle.ice_config = {iceServers: [{url: 'stun:stun.l.google.com:19302'}]};

			try {
				var video = true;
				var sourceId = localStorage.getItem("sourceId");

				if(sourceId) video = {optional: [{sourceId: sourceId}]};

				RTC.getUserMedia({audio:false,video:video},
					function (stream) {
						console.log('onUserMediaSuccess');
						chat.localStream = stream;
						connection.jingle.localStream = stream;
						var local = document.getElementById('localVideo');
						if (local != null) {
							local.muted = true;
							local.volume = 0;
							local.autoplay = true;
							RTC.attachMediaStream($(local), stream);
						}
					},
					function (error) {
						console.warn('Failed to get access to local media. Error ', error);
					});
			} catch (e) {
				console.error('GUM failed: ', e);
			}

			this.connection.connect('anonymous.bam.yt', null, function(status) {
				if (status == Strophe.Status.CONNECTED) {
					if (chat.localStream && chat.connection.connected && Strophe.getNodeFromJid(chat.connection.jid) != null) {
						chat.joinRoom(user,room.toLowerCase());
					}
				}
			});
		}

		chat.disconnect = function(){
			if (chat.connection && chat.connection.connected) {
				chat.connection.jingle.localStream.stop();
				chat.connection.options.sync = true;
				chat.connection.flush();
				chat.connection.disconnect();
				chat.connection.options.sync = false;
			}
		}


		chat.joinRoom = function(username,room) {
			chat.roomName = room + '@conference.bam.yt';
			chat.nickname = username+"___"+Math.random();
			console.log("Connecting to: "+encodeURIComponent(room));
			chat.connection.addHandler(chat.onPresence.bind(this), null, 'presence', null, null, chat.roomName, {matchBare: true});
			chat.connection.addHandler(chat.onPresenceUnavailable.bind(this), null, 'presence', 'unavailable', null, chat.roomName, {matchBare: true});

			pres = $pres({to: chat.roomName + '/' + chat.nickname }).c('x', {xmlns: 'http://jabber.org/protocol/muc'});
			chat.connection.send(pres);
		};

		chat.onPresence = function(pres) {
			var from = pres.getAttribute('from'),
				type = pres.getAttribute('type');
			if (type != null) {
				return true;
			}
			if ($(pres).find('>x[xmlns="http://jabber.org/protocol/muc#user"]>status[code="201"]').length) {
				// http://xmpp.org/extensions/xep-0045.html#createroom-instant
				var create = $iq({type: 'set', to: this.roomName})
					.c('query', {xmlns: 'http://jabber.org/protocol/muc#owner'})
					.c('x', {xmlns: 'jabber:x:data', type: 'submit'});
				this.connection.send(create); // fire away
			}
			if (from == this.roomName + '/' + this.nickname) {
				for (var peer in chat.peers) {
					chat.connection.jingle.initiate(peer, chat.roomName + '/' + chat.nickname);
				}
			} else {
				chat.peers[from] = 1;
			}
			return true;
		};

		chat.onPresenceUnavailable = function(pres) {
			chat.connection.jingle.terminateByJid($(pres).attr('from'));
			delete chat.peers[from];
			return true;
		};

		return chat;

	});




