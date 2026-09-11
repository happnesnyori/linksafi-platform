from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='admin@linksafi.com').exists():
    user = User(email='admin@linksafi.com', username='admin', name='Admin User', role='organization', is_staff=True, is_superuser=True)
    user.set_password('admin123')
    user.save()
    print('Admin user created')
else:
    print('Admin user already exists')