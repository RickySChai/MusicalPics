
	"use strict";
	var bunny = "https://s-media-cache-ak0.pinimg.com/originals/da/98/1e/da981ed53735ed3d5dfec51e94e6024f.jpg";
	var trackid = [];
	var tag = "";


	window.onload = function() {
	}
	
	function makeRequest(url) {
		var request = new XMLHttpRequest();
		request.onload = getInfo;
		request.open("GET", url, true);
		request.send();
	}

	
	function getCredentials(cb) {
		console.log("getting creds");
	    var data = {
	        'grant_type': 'client_credentials',
	        'client_id': "ppXwxVsxXZqC2_Bd3kkt6N8JXccqppjeSdCCLtRJ",
	        'client_secret': "VdEcQDxJbU3dw1P45EqjRbl7mSWPRdwZuWjSBfDV"
	    };
	    var url = 'https://api.clarifai.com/v1/token';

	    return axios.post(url, data, {
	        'transformRequest': [
	            function() {
	                return transformDataToParams(data);
	            }
	        ]
	    }).then(function(r) {
	        localStorage.setItem('accessToken', r.data.access_token);
	        localStorage.setItem('tokenTimestamp', Math.floor(Date.now() / 1000));
	        cb();
	    }, function(err) {
	        console.log(err);
	    });
	}

	function transformDataToParams(data) {
	    var str = [];
	    for (var p in data) {
	        if (data.hasOwnProperty(p) && data[p]) {
	            if (typeof data[p] === 'string'){
	                str.push(encodeURIComponent(p) + '=' + encodeURIComponent(data[p]));
	            }
	            if (typeof data[p] === 'object'){
	                for (var i in data[p]) {
	                    str.push(encodeURIComponent(p) + '=' + encodeURIComponent(data[p][i]));
	                }
	            }
	        }
	    }
	    return str.join('&');
	}

	function postImage(imgurl) {
	    var accessToken = localStorage.getItem('accessToken');
	    var data = {
	        'encoded_data': imgurl
	    };
	    console.log(data);
	    var url = 'https://api.clarifai.com/v1/tag';
	    return axios.post(url, data, {
	        'headers': {
	            'Authorization': 'Bearer ' + accessToken
	        }
	        /*'content-type': 'application/x-www-form-urlencoded'*/
	    }).then(function(r) {
	         parseResponse(r.data);
	    }, function(err) {
	        console.log('Sorry, something is wrong: ' + err);
	    });
	}

	function parseResponse(resp) {
	    var tags = [];
	    if (resp.status_code === 'OK') {
	        var results = resp.results;
	        tags = results[0].result.tag.classes;
	    } else {
	        console.log('Sorry, something is wrong.');
	    }
	    console.log(tags);
	    for(var i = 0; i < tags.length; i++) {
	    	makeRequest("https://api.spotify.com/v1/search?query=" + tags[i] + "&offset=0&limit=20&type=track&market=US");
	    }
	    return tags;
	}

	function run(imgurl) {
	    if (Math.floor(Date.now() / 1000) - localStorage.getItem('tokenTimeStamp') > 86400
	        || localStorage.getItem('accessToken') === null) {
	        getCredentials(function() {
	            return postImage(imgurl);
	        });
	    } else {
	        return postImage(imgurl);
	    }
	}

	function getInfo() {
		var data = JSON.parse(this.responseText);
		var artists = [];
		for(var i = 0; i < data.tracks.items.length; i++) {	
			var song = data.tracks.items[i].name;
			var artist = data.tracks.items[i].artists[0].name;
			trackid.push(data.tracks.items[i].id);


			//get album art
			//get canonical id -> play music

			var flag = true;
			for(var j = 0; j < artists.length; j++) {
			  	if(artists[j] == artist) {
			  		flag = false;
			  	}
			}
			if(flag) {	
				artists.push(artist);
				var block = document.createElement("div");
				block.innerHTML = artist + " : " + song;
				document.getElementById("body").appendChild(block);
			}
		}
	}

	function getUploadPath() {
		var myFileTag = document.getElementById("fileUpload");
		if(myFileTag.files.length > 0) {
			return myFileTag.files[0].webkitRelativePath + myFileTag.files[0].name;
		} else {
			return "";
		}
	}

	function getPost() {
		var data = JSON.parse(this.responseText);
		console.log(data);
	}

	document.querySelector('input').addEventListener('change', function(){
		var reader = new FileReader();
		reader.onload = function() {
			var imageData = this.result;
			document.getElementById('result').innerHTML = '<img src="'+ imageData +'" />';
			imageData = imageData.replace(/^data:image\/(.*);base64,/, '');
			postImage(imageData);
		};
		reader.readAsDataURL(this.files[0]);
	}, false);
