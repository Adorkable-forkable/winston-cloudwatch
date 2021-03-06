describe('cloudwatch-integration', function() {

  var sinon = require('sinon'),
      should = require('should'),
      mockery = require('mockery');

  var stubbedWinston = {
    Transport: function() {}
  };
  var stubbedAWS = {
    CloudWatchLogs: function() {}
  };
  var stubbedCloudwatchIntegration = {
    upload: sinon.spy()
  };
  var clock = sinon.useFakeTimers();

  var WinstonCloudWatch;

  before(function() {
    mockery.enable();
    mockery.registerAllowable('util');

    mockery.registerMock('winston', stubbedWinston);
    mockery.registerMock('aws-sdk', stubbedAWS);
    mockery.registerMock('./lib/cloudwatch-integration', stubbedCloudwatchIntegration);

    mockery.registerAllowable('../index.js');
    WinstonCloudWatch = require('../index.js');

  });
  after(function() {
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('add', function() {
    describe('as json', function() {
      var transport;
      var options = {
        jsonMessage: true
      };
      before(function() {
        transport = new WinstonCloudWatch(options);
        transport.add({level:'level', msg:'message', meta: {key: 'value'}});
      });
      it('logs json', function() {
        clock.tick(2000);
        var message = stubbedCloudwatchIntegration.upload.args[0][3][0].message;
        var jsonMessage = JSON.parse(message);
        jsonMessage.level.should.equal('level');
        jsonMessage.msg.should.equal('message');
        jsonMessage.meta.key.should.equal('value');
      });
    });
    describe('as text', function() {
      var transport;
      var options = {
      };
      before(function() {
        transport = new WinstonCloudWatch(options);
        transport.add({level:'level', msg:'message', meta: {key: 'value'}});
      });
      it('logs text', function() {
        clock.tick(2000);
        var message = stubbedCloudwatchIntegration.upload.args[0][3][0].message;
        message.should.equal('{\n  "level": "level",\n  "msg": "message",\n  "meta": {\n    "key": "value"\n  }\n}');
      });
    });
  });
});
