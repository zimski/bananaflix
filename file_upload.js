var express = require("express"),
    bodyParser = require("body-parser"),
    multer = require("multer"),
    path = require("path"),
    torrentStream = require("torrent-stream"),
    readTorrent = require('read-torrent'),
    spawn = require('child_process').spawn,
    fs = require("fs"),
    app = express();

// tell express to use the bodyParser middleware
// and set upload directory
app.use(bodyParser({ keepExtensions: true, uploadDir: "uploads" }));
app.engine('jade', require('jade').__express);
app.use(express.static(path.join(__dirname, 'public')));
app.use(multer({ dest: './torrents/',
 rename: function (fieldname, filename) {
    return filename+Date.now();
  },
onFileUploadStart: function (file) {
  console.log(file.originalname + ' is starting ...')
},
onFileUploadComplete: function (file) {
  console.log(file.fieldname + ' uploaded to  ' + file.path)
  done=true;
  torrent_path = path.resolve("./" + file.path) ;
  torrent_path = "/Users/c/node/bananaflix/torrents/House.of.Cards.2013.S03E04.VOSTFR.720p.WEBRip.DD5.1.x264-SEEHD1425583840303.torrent"
  readTorrent(torrent_path, function (err, torrent, raw) {
    if (err) {
      console.error(err.message)
      process.exit(1)
    }
   stream_torrent(raw) // use raw so we don't get infohash/metadata issues in torrent-stream.
  });
}
}));

// render file upload form
app.get("/", function (request, response) {
    response.render("upload_form.jade");
});
app.post('/upload',function(req,res){
  if(done==true){
    console.log(req.files);
    res.end("File uploaded.");

  }
});

var engine = {};
var torrentPathSotre = '/tmp/bananaflix_content';
function stream_torrent(raw) {
  console.log("start torrent");
  var wstream = fs.createWriteStream(torrentPathSotre);
  console.log(raw);
  engine = torrentStream(raw);
  engine.on('ready', function() {
    var maxLength = 0;
    fileChoosen = engine.files.reduce( function(fileP, currentFile, index, array)
      { return (currentFile.length > fileP.length)? currentFile : fileP},
      {length: 0});
    console.log("file choosen ", fileChoosen.length);
    fileChoosen.select();
    var stream = fileChoosen.createReadStream();
    stream.pipe(wstream);
  });
  engine.on('download', function(){
    console.log("speed download ", engine.swarm.downloadSpeed());
    if (engine.download > 5000000) {
      console.log('fire up omxplayer');
     spawn("omxplayer",[torrentPathSotre]) ;
    }
  });
}
app.listen(3000);
