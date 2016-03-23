define(['jquery','./view','strophe','../configuration','../logger'],
	function($,view, strophe,configuration,logger) {
		var connection = {};
		connection.peers = {};
		connection.localStream = null;

		$(document).bind('settings.close', function(event){
			logger.debug(logger.components.connection,"Event: settings.close",event);
			connection.reconnect();
		});

		$(document).bind('callincoming.jingle', function(event, sid) {
			logger.debug(logger.components.connection,"Event: callincoming.jingle",[event,sid]);
			var sess = self.connection.jingle.sessions[sid];
			sess.sendAnswer();
			sess.accept();
		});

		$(document).bind('view.cameraToggle', function(event,state) {
			logger.debug(logger.components.connection,"Event: view.cameraToggle",[event,state]);
			state = (state != "true");
			if(state){
				connection.reconnect(true);
			}else{
				connection.reconnect();
			}
			view.toggleVideoCam(state);
		});

		$(document).bind('callterminated.jingle', function(event, sid, reason) {
			logger.debug(logger.components.connection,"Event: callterminated.jingle",[event,sid,reason]);
			view.removeVideo(sid);
		});

		$(document).bind('iceconnectionstatechange.jingle', function(event, sid, sess) {
			logger.debug(logger.components.connection,"Event: iceconnectionstatechange.jingle",[event,sid,sess]);
			if (sess.peerconnection.signalingState == 'stable' && (sess.peerconnection.iceConnectionState == 'connected' || sess.peerconnection.iceConnectionState == 'completed')) {
				var nickname = atob(sess.peerjid.split("/")[1].split("___")[0]);
				logger.log(logger.components.connection,"Incoming connection from "+nickname);
				var el = view.createVideo(nickname,sid);
				RTC.attachMediaStream($(el), sess.remoteStream);
				view.appendVideo(el);
			}
			if(sess.peerconnection.iceConnectionState == 'disconnected' || sess.peerconnection.iceConnectionState == 'closed'){
				view.removeVideo(sid);
				return;
			}
		});

		$(window).bind('beforeunload', function(event) {
			logger.debug(logger.components.connection,"Event: beforeunload",event);
			connection.disconnect();
		});
		
		connection.reconnect = function (noLocalVideo) {
			connection.disconnect();
			connection.connect(connection.user,connection.room,noLocalVideo)
		}

		connection.connect = function(user,room,noLocalVideo){
			connection.user = user;
			connection.room = room;
			connection.strophe = new strophe.Connection(configuration.bosh);
			if (false) {
				connection.strophe.rawInput = function(data) { console.log('RECV: ' + data); };
				connection.strophe.rawOutput = function(data) { console.log('SEND: ' + data); };
			}
			connection.strophe.jingle.pc_constraints = RTC.pc_constraints;
			connection.strophe.jingle.ice_config = {iceServers: [{url: configuration.stun}]};

			if(!noLocalVideo)
			connection.attachLocalMediaStream();

			connection.strophe.connect(configuration.domain, null, function(status) {
				if (status == Strophe.Status.CONNECTED) {
					if (connection.localStream && connection.strophe.connected && strophe.getNodeFromJid(connection.strophe.jid) != null) {
						connection.joinRoom(user,room.toLowerCase(),noLocalVideo);
					}
				}
			});
		}

		connection.attachLocalMediaStream = function(){
			try {
				var video = true;
				var sourceId = localStorage.getItem("sourceId");

				if(sourceId) video = {optional: [{sourceId: sourceId}]};

				RTC.getUserMedia({audio:false,video:video},
					function (stream) {
						connection.localStream = stream;
						connection.strophe.jingle.localStream = stream;
						var local = view.getLocalVideo();
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
		}

		connection.disconnect = function(){
			if (connection.strophe && connection.strophe.connected) {
				if(connection.strophe.jingle.localStream)
					connection.strophe.jingle.localStream.stop();
				connection.strophe.options.sync = true;
				connection.strophe.flush();
				connection.strophe.disconnect();
				connection.strophe.options.sync = false;
			}
		}


		connection.joinRoom = function(username,room,noLocalVideo) {
			connection.roomName = room + '@conference.bam.yt';
			connection.nickname = username+"___"+Math.random();
			logger.log(logger.components.connection,"Connecting to: "+encodeURIComponent(room));
			connection.strophe.addHandler(connection.onPresence.bind(this), null, 'presence', null, null, connection.roomName, {matchBare: true});
			connection.strophe.addHandler(connection.onPresenceUnavailable.bind(this), null, 'presence', 'unavailable', null, connection.roomName, {matchBare: true});

			if(!noLocalVideo)
			connection.strophe.send($pres({to: connection.roomName + '/' + connection.nickname }).c('x', {xmlns: 'http://jabber.org/protocol/muc'}));
		};

		connection.onPresence = function(pres) {
			logger.debug(logger.components.connection,"Event: onPresence",[pres]);
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
				for (var peer in connection.peers) {
					connection.strophe.jingle.initiate(peer, connection.roomName + '/' + connection.nickname);
				}
			} else {
				connection.peers[from] = 1;
			}
			return true;
		};

		connection.onPresenceUnavailable = function(pres) {
			logger.debug(logger.components.connection,"Event: onPresenceUnavailable",[pres]);
			connection.strophe.jingle.terminateByJid($(pres).attr('from'));
			delete connection.peers[from];
			return true;
		};

		window.c = connection;
		return connection;

	});




