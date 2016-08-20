require('lookup-multicast-dns/global');
var topology = require('fully-connected-topology');
var jsonStream = require('duplex-json-stream');
var streamSet = require('stream-set');
var toPort = require('hash-to-port');
var register = require('register-multicast-dns');


var me = process.argv[2];
var peers = process.argv.slice(3);

var swarm = topology(toAddress(me), peers.map(toAddress));
var connections = streamSet();
//var received = {};
register(me);

swarm.on('connection', function (socket, id) {
  console.log('info> direct connection to', id);

  socket = jsonStream(socket)
  socket.on('data', function (data) {
    console.log(data.username + '> ' + data.message);

  });

  connections.add(socket);
});
process.stdin.on('data', function (data) {
  connections.forEach(function (socket) {
    var message = data.toString().trim() ;
    socket.write({username: me, message: message})
});
});
function toAddress (name) {
  return name + '.local:' + toPort(name);
}
