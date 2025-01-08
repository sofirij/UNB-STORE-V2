from flask import Flask, redirect, render_template, request, session, jsonify
from flask_session import Session
from helpers import login_required
from dotenv import load_dotenv
from datetime import timedelta
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

@app.route("/register", methods=["GET", "POST"])
def register():
    """Allow new users to register to the database"""
    if request.method == "POST":
        username = request.form.get("username")
        firstPassword = request.form.get("first-password")
        secondPassword = request.form.get("second-password")
        
        
    return render_template("register.html")

@app.route("/login", methods=["POST"])
def login():
    """Allow already registered users to login to their account"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    
    return render_template("login.html")

@app.route("/checkRegisterUsername", methods=["POST"])
def checkRegisterUsername():
    """"Validate that the registered username is not already in use"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if usernameExists(username):
        return jsonify({'exists': True})
    else:
        # register user to the db
        with sqlite3.connect("app.db") as conn:
            cursor = conn.cursor()
            query = "INSERT INTO users (username, password_hash, is_active, is_admin) VALUES (?, ?, 1, 0)"
            cursor.execute(query, (username, generate_password_hash(password)))
            conn.commit()
            #session["user_id"] = cursor.execute(query, (username,)).fetchall()[0][0]
            
        return jsonify({'exists': False})


    
    

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)