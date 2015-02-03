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
        "keypress textarea": "textarea_keypress",
        'focusout input,textarea': 'save_bookmark'
    },
    textarea_keypress: function(e){
        if ((e.keyCode == 10 || e.keyCode == 13) && e.ctrlKey){
            this.save_bookmark(e);
        }
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
        this.model.set(data);
    },
    save_bookmark: function(e){
        this.model.save();
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

    bv = new BookmarkView({el: $("#content"), model:b});
    bv.render();
})
