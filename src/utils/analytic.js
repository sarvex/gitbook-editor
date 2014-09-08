define([
    "hr/utils",
    "hr/storage"
], function(_, storage) {
    var pkg = node.require("../package.json");
    var Mixpanel = node.require('mixpanel');
    var mixpanel = Mixpanel.init('7e730719b2cfbbbcfc3a3df873641a08');

    // Create a unique id for this editor (will be stored in localstorage)
    var visitorId = storage.get("distinct_id_visitor") || "visitor:"+Math.random().toString(36).substring(7);

    // Id used for tracking
    var distinctId = storage.get("distinct_id") || visitorId;

    // Track an event
    var track = function(e, data) {
        console.log("track", e, "("+distinctId+")");
        mixpanel.track("editor."+e, _.extend(data || {}, {
            'version': pkg.version,
            'platform': process.platform,
            'arch': process.arch,
            'distinct_id': distinctId
        }));
    };

    // Define distinctId to use, if null: reset to visitor id
    var setDistinctId = function(uId) {
        distinctId = uId || visitorId;
        console.log("define distinct_id", distinctId, uId);

        storage.set("distinct_id", distinctId);
        storage.set("distinct_id_visitor", visitorId);
    };

    // Signal that the editor started
    track("start");

    return {
        track: track,
        setDistinctId: setDistinctId
    };
});