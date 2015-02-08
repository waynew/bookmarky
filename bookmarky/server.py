import os
import json
from flask import Flask, render_template, jsonify, url_for, request, redirect,\
                  flash

app = Flask(__name__)
app.secret_key = "this is a weak secret. Replace it."
mybookmarks = {}
BOOKMARK_FILE = 'bookmarks.json'

def add_bookmark(url, title, tags, notes):
    mybookmarks = load_bookmarks()
    new_id = 1 if not mybookmarks else max(mybookmarks.keys())+1
    bookmark = {'url': url,
                'title': title,
                'tags': tags,
                'notes': notes,
                'id': new_id,
                }
    mybookmarks[new_id] = bookmark
    with open(BOOKMARK_FILE, 'w') as f:
        json.dump(mybookmarks, f)


def really_delete_bookmark(id):
    mybookmarks = load_bookmarks()
    app.logger.debug("deleting bookmark <%s> type <%s>", id, type(id))
    try:
        del mybookmarks[int(id)]
    except KeyError:
        app.logger.warning("Failed to delete bookmark <%s>", id)
        app.logger.debug(mybookmarks)
    else:
        app.logger.debug(mybookmarks)
        with open(BOOKMARK_FILE, 'w') as f:
            json.dump(mybookmarks, f)


def load_bookmarks():
    with open(BOOKMARK_FILE, 'r') as f:
        try:
            mybookmarks = {int(k): v for k,v in json.load(f).items()}
        except ValueError:
            mybookmarks = {}
    return mybookmarks


@app.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)


def dated_url_for(endpoint, **values):
    if endpoint == 'static':
        filename = values.get('filename', None)
        if filename:
            file_path = os.path.join(app.root_path,
                                     endpoint,
                                     filename)
            values['q'] = int(os.stat(file_path).st_mtime)
    return url_for(endpoint, **values)


@app.route("/")
def main():
    return render_template('index.html')


@app.route("/bookmarks/", defaults={'tag': None})
@app.route("/bookmarks/<tag>")
def list_bookmarks(tag):
    bookmarks = load_bookmarks()
    if tag:
        bookmarks = {k: v for k,v in bookmarks.items() if tag in v['tags']}
    return render_template('bookmarks.html',
                           bookmarks=sorted(bookmarks.values(),
                                            key=lambda x: x['id']),
                           tag=tag,
                           )


@app.route("/bookmark/new", methods=['GET', 'POST'])
def new_bookmark():
    if request.method == 'POST':
        flash("Bookmark saved")
        app.logger.debug(request.form)
        url = request.form.get('url', '')
        title = request.form.get('title', '')
        tags = [tag.strip() for tag in request.form.get('tags', '').split(',')]
        notes = request.form.get('notes', '')
                
        add_bookmark(url, title, tags, notes)
        return redirect(url_for('list_bookmarks'))
    return render_template('new_bookmark.html')


@app.route('/bookmark/delete/<id>', methods=['DELETE'])
def delete_bookmark(id):
    really_delete_bookmark(id)
    return 'success'


@app.route("/api/v1/bookmark",
           defaults={'id': None}, methods=['POST', 'PUT', 'DELETE'])
@app.route("/api/v1/bookmark/<int:id>", methods=['POST', 'PUT', 'DELETE'])
def bookmark(id):
    print(request.json)
    data = request.json
    if request.method == 'POST':
        new_id = 1 if not mybookmarks else max(mybookmarks.keys())+1
        data['id'] = new_id
        mybookmarks[new_id] = data
    elif request.method == 'PUT':
        mybookmarks[id] = data
    elif request.method == 'DELETE':
        try:
            app.logger.debug("Deleting id <%s> type <%s>", id, type(id))
            del mybookmarks[id]
            print("Deleted bookmark #"+str(id))
            with open('2bookmarks.json', 'w') as f:
                json.dump(mybookmarks, f)
            return jsonify(message="Deleted bookmark #"+str(id))
        except KeyError:
            print("No bookmark with id #"+str(id))
            print(mybookmarks)
            with open('2bookmarks.json', 'w') as f:
                json.dump(mybookmarks, f)
            return jsonify(message="No bookmark with id #"+str(id))
    with open('2bookmarks.json', 'w') as f:
        json.dump(mybookmarks, f)
    return jsonify(data)


@app.route("/api/v1/bookmarks")
def bookmarks():
    return jsonify(bookmarks=list(mybookmarks.values()))


if __name__ == "__main__":
    app.run('0.0.0.0', port=5555, debug=True)
