function main(){
	var self = this;
	this.peers = {};
	this.localStream = null;
	var i = 2;
	$(document).bind('callincoming.jingle', function(event, sid) {
		console.log('callincoming');
		var sess = self.connection.jingle.sessions[sid];
		sess.sendAnswer();
		sess.accept();
	});
	$(document).bind('callactive.jingle', function(event, video, sid) {
		console.log('callactive');
		$('#videos').append(video);
	});
	$(document).bind('callterminated.jingle', function(event, sid, reason) {
		console.log('callterminated');
		$('#videos').find('>#remoteVideos_' + sid).fadeOut(350,function(){
			$('#videos').find('>#remoteVideos_' + sid).remove();
		});
	});

	/*
		$(document).bind('remotestreamadded.jingle', function(event, data, sid) {});
		$(document).bind('remotestreamremoved.jingle', function(event, data, sid) {});
	*/
	
	$(document).bind('iceconnectionstatechange.jingle', function(event, sid, sess) {
		if (sess.peerconnection.signalingState == 'stable' && 
			(sess.peerconnection.iceConnectionState == 'connected' || sess.peerconnection.iceConnectionState == 'completed')) {
			if ($('#videos').find('>#remoteVideos_' + sid).length) {
				return;
			} 
			var nickname = sess.peerjid.split("/")[1].split("___")[0];
				nickname = atob(nickname);
			
			var el = $('<video style="z-index:'+i+';" data_nickname="'+nickname+'" autoplay="autoplay" oncontextmenu="return false;"/>').attr('id', 'remoteVideos_' + sid);
			
			$(document).trigger('callactive.jingle', [el, sid]);
			RTC.attachMediaStream($(el), sess.remoteStream); 
		}
		if(sess.peerconnection.iceConnectionState == 'disconnected' || sess.peerconnection.iceConnectionState == 'closed'){
			$('#videos').find('>#remoteVideos_' + sid).fadeOut(350,function(){
				$('#videos').find('>#remoteVideos_' + sid).remove();
			});
			return;
		}
	});

	
	$(document).bind('ringing.jingle', function(event, sid) {
		 console.log('ringing.jingle');
	 });
	 
	$(document).bind('mute.jingle', function(event, sid, content) {
		 console.log('mute.jingle');
	 });
	$(document).bind('unmute.jingle', function(event, sid, content) {
		 console.log('unmute.jingle');
	 });
	 
	$(window).bind('beforeunload', function() {
		self.disconnect();
	});
}
		

main.prototype.connect = function(user,room){
	var self = this;
	
	var connection = this.connection = new Strophe.Connection('https://chat.freakynois.es/http-bind/');
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
				self.localStream = stream;
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
			if (self.localStream && self.connection.connected && Strophe.getNodeFromJid(self.connection.jid) != null) {
				self.joinRoom(user,room.toLowerCase());
			}
        }
    });
}

main.prototype.disconnect = function(){
	if (this.connection && this.connection.connected) {
		this.connection.jingle.localStream.stop();
	   this.connection.options.sync = true; 
		this.connection.flush();
		this.connection.disconnect();
	   this.connection.options.sync = false; 
	}
}


main.prototype.joinRoom = function(username,room) {
    this.roomName = room + '@conference.bam.yt';
    this.nickname = username+"___"+Math.random();
	console.log("Connecting to: "+encodeURIComponent(room));
    this.connection.addHandler(this.onPresence.bind(this), null, 'presence', null, null, this.roomName, {matchBare: true});
    this.connection.addHandler(this.onPresenceUnavailable.bind(this), null, 'presence', 'unavailable', null, this.roomName, {matchBare: true});

    pres = $pres({to: this.roomName + '/' + this.nickname }).c('x', {xmlns: 'http://jabber.org/protocol/muc'});
    this.connection.send(pres);
};

main.prototype.onPresence = function(pres) {
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
        for (var peer in this.peers) {
            this.connection.jingle.initiate(peer, this.roomName + '/' + this.nickname);
        }
    } else {
        this.peers[from] = 1;
    }
    return true;
};

main.prototype.onPresenceUnavailable = function(pres) {
    this.connection.jingle.terminateByJid($(pres).attr('from'));
    delete this.peers[from];
    return true;
};

