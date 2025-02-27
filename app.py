from flask import Flask, redirect, render_template, request, session, jsonify
from flask_session import Session
from helpers import login_required
from dotenv import load_dotenv
from datetime import timedelta
from functions import *
import os

load_dotenv()

# configure application
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "fallback-secret-key")

# configure session to use filesystem
app.config["SESSION PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"

# set the session lifetime
app.permanent_session_lifetime = timedelta(minutes=60)

# create session
Session(app)

@app.route("/", methods=["GET", "POST"])
@login_required
def index():
    """"Give users the option to search for items in inventory"""
    return render_template("index.html")

@app.after_request
def after_request(response):
    """ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

@app.route("/register", methods=["GET"])
def register():
    """Display the registration form for users to input information"""
    return render_template("register.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    """Allow already registered users to login to their account"""
    if request.method == "POST":
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if loginUser(username, password):
            session["user_id"] = getUserId(username)
            session["display_name"] = getDisplayName(username)
            session["profile_pic"] = getProfilePic(username)
            return jsonify({"successful": True})
        else:
            return jsonify({"successful": False})
    else:
        return render_template("login.html")

@app.route("/registerUser", methods=["POST"])
def registerUser():
    """"Validate that the registered username is not already in use and register the user"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    displayName = data.get('displayName')
    
    invalids = registerUsername(username, password, displayName)
    
    if not invalids:
        return jsonify({"successful": True})
    else:
        return jsonify({"successful": False, "invalids": invalids})

@app.route("/logout", methods=["GET"])
def logout():
    """Clear the users session"""
    session.clear()
    return redirect("/")

@app.route("/profile", methods=["GET"])
@login_required
def profile():
    """"Allow users to manage information about their profile"""
    return render_template("profile.html")

@app.route("/inventory", methods=["GET"])
@login_required
def inventory():
    """"Display the inventory of the user and allow the user to edit their inventory"""
    user_id = session["user_id"]
    inventory = getUserInventory(user_id)
    return render_template("inventory.html", inventory=inventory, filenames=INVENTORY_FILENAMES)

@app.route("/inventory/update/<int:item_id>", methods=["PUT"])
@login_required
def updateInventory():
    """"Update the inventory of the user"""
    data = request.get_json()
    item_id = data.get('item_id')
    category = data.get('category')
    item_filename = data.get('item_filename')
    price = data.get('price')
    description = data.get('description')
    name = data.get('name')
    quantity = data.get('quantity')
    
    updateInventory(item_id, category, item_filename, name, price, quantity, description)
    return jsonify({"successful": True})

@app.route("/inventory/delete/<int:item_id>", methods=["DELETE"])
@login_required
def deleteInventory(item_id):
    """"Delete an item from the inventory of the user"""  
    deleteInventory(item_id)
    return jsonify({"successful": True})

@app.route("/inventory/add", methods=["POST"])
@login_required
def addInventory():
    """"Add an item to the inventory of the user"""
    user_id = session["user_id"]
    category = request.form.get("categories-0")
    name = request.form.get("item-name-0")
    price = request.form.get("item-price-0")
    quantity = request.form.get("item-quantity-0")
    description = request.form.get("item-description-0")
    indexes = request.form.getlist("indexes")
    images = request.files.getlist("images")
    fileExtensions = [image.filename.split('.')[-1] for image in images]
    
    # Validate files
    for image in images:
        if not isImage(image):
            return jsonify({"successful": False, "message": "Please upload only images"})
        if not isValidSize(image):
            return jsonify({"successful": False, "message": "Please upload images less than 10MB"})
        if not isValidExtension(image.filename):
            return jsonify({"successful": False, "message": "Invalid file extension"})
        
    # Print the image size for debugging
    for image in images:
        image_size = len(image.read())
        print(f"Received file: {image.filename}, size: {image_size} bytes")
        image.seek(0)  # Reset file pointer to the beginning
    
    # Insert a new user_id into the database and return the new item_id
    item_id = newItemToInventory(user_id)
    
    # Then create a list of new filenames using the item_id and the index
    image_filenames = createFilenames(fileExtensions, indexes, item_id)
    
    # Then update the info in that row with the new filenames and other item info 
    updateItemDetails(item_id, category, name, price, quantity, description, image_filenames)
    
    # Store files in the file system
    for image, filename in zip(images, image_filenames):
        image.save(os.path.join('static', 'inventory-pics', f'user-{user_id}', filename))
    return jsonify({"successful": True})

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)  