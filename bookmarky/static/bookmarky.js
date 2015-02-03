var Bookmark = Backbone.Model.extend({
    urlRoot: '/api/v1/bookmark',
    defaults: {
        url: '',
        title: '',
        notes: '',
        tags: [],
    },
    initialize: function(){
        console.log("It worked!");
    }
});

var BookmarkView = Backbone.View.extend({
    events: {
        "change input": "field_changed",
        "change textarea": "field_changed",
        "click button": "save_bookmark",
    },
    field_changed: function(e){
        var field = $(e.currentTarget);
        //console.log(field);
        var data = {};
        var id = field.attr('id');
        if (id === "tags"){
            data[id] = field.val().split(',').map(function(s){ return s.trim(); });
        }
        else {
            data[id] = field.val();
        }
        console.log(data);
        console.log("Field changed");
    },
    save_bookmark: function(e){
        var btn = $(e.currentTarget);
        console.log("Save clicked");
    },
    render: function(){
        var template = _.template($("#bookmark_template").html(), {});
        this.$el.html(template);
        $("#url").focus();
    }
});

$(function(){
    console.log('page loaded');
    b = new Bookmark();
    b.set("url", "hello world");
    b.save().success(function(){ b.destroy(); });

    bv = new BookmarkView({el: $("#content")});
    bv.render();
})
