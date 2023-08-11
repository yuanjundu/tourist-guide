echo "Deploying app..."

git checkout develop
npm run build
scp -r build/* student@137.43.49.77:/var/www/137.43.49.77/

echo "App deployed on 137.43.49.77"
