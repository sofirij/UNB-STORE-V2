from flask import Flask, redirect, render_template, request, session, jsonify
from flask_session import Session
from helpers import login_required
from dotenv import load_dotenv
from datetime import timedelta
from functions import registerUsername, usernameExists, loginUser, getUserId
import os
import sqlite3

load_dotenv()

# configure application
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "fallback-secret-key")

# configure session to use filesystem
app.config["SESSION PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
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

@app.route("/login", methods=["POST"])
def login():
    """Allow already registered users to login to their account"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if loginUser(username, password):
        session["user_id"]
        return jsonify({"successful": True})
    else:
        return jsonify({"successful": False})

@app.route("/registerUser", methods=["POST"])
def registerUser():
    """"Validate that the registered username is not already in use and register the user"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if registerUsername(username, password):
        return jsonify({"successful": True})
    else:
        return jsonify({"successful": False})


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)