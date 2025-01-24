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
app.permanent_session_lifetime = timedelta(minutes=10)

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
    
    if registerUsername(username, password, displayName):
        return jsonify({"successful": True})
    else:
        return jsonify({"successful": False})

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
    return render_template("inventory.html")

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)