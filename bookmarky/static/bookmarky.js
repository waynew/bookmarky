var Bookmark = Backbone.Model.extend({
    urlRoot: '/api/v1/bookmark',
    defaults: {
        url: '',
        title: '',
        notes: '',
        tags: [],
    },
    initialize: function(){
        //console.log("It worked!");
    }
});

var Bookmarks = Backbone.Collection.extend({
    model: Bookmark,
    url: '/api/v1/bookmarks',
    parse: function(response){
        return response['bookmarks'];
    }
});

var BookmarkView = Backbone.View.extend({
    initialize: function(){
        if (this.model){
            this.model.on('change', this.update, this);
        }
    },
    events: {
        "change input": "field_changed",
        "change textarea": "field_changed",
        "click #save_button": "save_bookmark",
        "click #delete_button": "destroy",
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
        console.log(this.model.attributes);
        this.model.save().success(function(data){
            console.log("Saved");
        });
    },
    update: function(){
        $("#goto").attr('href', this.model.get('url'));
        $("#url").val(this.model.get('url'));
        $("#title").val(this.model.get('title'));
        $("#tags").val(this.model.get('tags').join(', '));
        $("#notes").val(this.model.get('notes'));
    },
    destroy: function(){
        //this.$el.hide();
    },
    render: function(arg){
        var template = _.template($("#bookmark_template").html());
        this.$el.html(template({bookmark: this.model.attributes}));
        if (!arg){
            //this.$el.hide();
            var el = this.$el;
        }
    }
});

var ViewBookmarkView = Backbone.View.extend({
    events: {
        'click button.delete': 'destroy',
        'click .bookmark_view': 'activate'
    },
    activate: function(){
        var view = new BookmarkView({el: $('#content'), model: this.model});
        view.render();
    },
    destroy: function(e){
        if (confirm("Really delete?")){
            this.model.destroy().success(function(){
                console.log("Destroyed");
            }).error(function(){
                console.log("Not destroyed");
                console.log(data);
            });
            this.$el.remove();
        }
    },
    render: function(arg){
        var templ = _.template($("#bookmark_view").html());
        this.$el.html(templ({bookmark: this.model.attributes}));
        return this;
    }
});

var BookmarkListView = Backbone.View.extend({
    render: function(){
        var tags = [];
        this.$el.empty();
        for(var i = 0; i < this.collection.length; i++){
            //var templ = _.template($("#bookmark_view").html());
            //this.$el.append(templ({bookmark: this.collection.at(i).attributes}));
            var view = new ViewBookmarkView({model: this.collection.at(i)});
            this.$el.append(view.render().$el);
        }
        /*
        _.each(this.collection.pluck('tags'), function(t){
            tags = tags.concat(t);
        });
        console.log(tags);
        tags = _.uniq(tags);
        tags.sort();
        var template = _.template($("#tags_template").html());
        this.$el.html(template({tags: tags}));
        */
    }
});

var Router = Backbone.Router.extend({
    routes: {
        ":category": "show_category"
    }
});

var router = new Router();
router.on('route:show_category', function(category){
    //console.log('showing '+category);
});

Backbone.history.start();

$(function(){
    /*
    console.log('page loaded');
    b = new Bookmark();

    bv = new BookmarkView({el: $("#content"), model:b});
    bv.render();
    */
    $("#new_button").click(function(){ 
        var b = new Bookmark();
        var bv = new BookmarkView({el: $("#content"), model:b});
        bv.render();
    });

    bookmarks = new Bookmarks();
    bookmarks.fetch()
        .success(function(){
            window.blv = new BookmarkListView({el: $('#categories'),
                                               collection: bookmarks});
            window.blv.render();
        });
    /*
    tags = [];
    bookmarks.fetch().success(function(){
        $("#categories").empty();
        _.each(bookmarks.pluck('tags'), function(t){
            tags = tags.concat(t);
        });
        console.log(tags);
        tags = _.uniq(tags);
        tags.sort();
        _.each(tags, function(tag){
            $("#categories").append($('<div>', {text:tag}));
            console.log(tag);
        });

    });
    */
})
