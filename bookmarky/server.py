import os
import json
from flask import Flask, render_template, jsonify, url_for, request

app = Flask(__name__)
mybookmarks = {}

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
            with open('bookmarks.json', 'w') as f:
                json.dump(mybookmarks, f)
            return jsonify(message="Deleted bookmark #"+str(id))
        except KeyError:
            print("No bookmark with id #"+str(id))
            print(mybookmarks)
            with open('bookmarks.json', 'w') as f:
                json.dump(mybookmarks, f)
            return jsonify(message="No bookmark with id #"+str(id))
    with open('bookmarks.json', 'w') as f:
        json.dump(mybookmarks, f)
    return jsonify(data)


@app.route("/api/v1/bookmarks")
def bookmarks():
    return jsonify(bookmarks=list(mybookmarks.values()))


if __name__ == "__main__":
    app.run('0.0.0.0', port=5555, debug=True)
