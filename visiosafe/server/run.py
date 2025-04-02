from app import create_app
app = create_app()

if __name__ == '__main__':
    with app.app_context():
        from app.extensions import db
        db.create_all()
        print("✅ Base initialisée !")
    app.run(debug=True, use_debugger=True, use_reloader=True)