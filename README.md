# Excis Billing System

A comprehensive Django-based billing and customer management system for Excis. This application handles customer accounts, billing cycles, purchase orders, rate cards, and invoice generation.

## Features

- **Customer Management**: Create and manage customer accounts with detailed information
- **Billing Cycles**: Set up and manage billing periods for customers
- **Purchase Orders**: Generate and track purchase orders with PDF export
- **Rate Cards**: Manage pricing and rate structures
- **Invoice Generation**: Automated invoice creation and PDF generation
- **Dashboard**: Overview of key metrics and recent activities
- **Multi-currency Support**: Handle different currencies and countries

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Docker](https://docs.docker.com/get-docker/) (version 20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or higher)
- [Git](https://git-scm.com/downloads)

## Quick Start with Docker

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Billing-Deployment-Repo
```

### 2. Environment Configuration

The application comes with default development settings. For production deployment, you should:

1. Create a `.env` file in the project root
2. Update the following environment variables:

```env
# Database Configuration
MYSQL_DATABASE=your_database_name
MYSQL_USER=your_database_user
MYSQL_PASSWORD=your_secure_password
MYSQL_ROOT_PASSWORD=your_root_password

# Django Configuration
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=your-domain.com,localhost

# Optional: Email Configuration
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@domain.com
EMAIL_HOST_PASSWORD=your-email-password
```

### 3. Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

This command will:
- Build the Django application container
- Start a MySQL 8.0 database container
- Run database migrations
- Collect static files
- Start the web server

### 4. Access the Application

Once the containers are running, you can access the application at:

- **Web Application**: http://localhost:8000
- **Database**: localhost:3306 (MySQL)

### 5. Create a Superuser (Optional)

To access the Django admin interface, create a superuser account:

```bash
# Execute command in the running web container
docker-compose exec web python manage.py createsuperuser
```

Then visit http://localhost:8000/admin/ to access the admin interface.

## Docker Commands Reference

### Basic Operations

```bash
# Start services
docker-compose up

# Start services in background
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: This will delete your database)
docker-compose down -v

# View logs
docker-compose logs

# View logs for specific service
docker-compose logs web
docker-compose logs db
```

### Development Commands

```bash
# Run Django management commands
docker-compose exec web python manage.py <command>

# Examples:
docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py collectstatic
docker-compose exec web python manage.py createsuperuser
docker-compose exec web python manage.py shell

# Access database shell
docker-compose exec db mysql -u pickfres_billingAccess -p pickfres_billing

# Run tests
docker-compose exec web python manage.py test
```

### Container Management

```bash
# Rebuild containers after code changes
docker-compose up --build

# Restart a specific service
docker-compose restart web

# View running containers
docker-compose ps

# Execute shell in web container
docker-compose exec web bash
```

## Project Structure

```
Billing-Deployment-Repo/
├── apps/                    # Django applications
│   ├── accounts/           # User authentication
│   ├── billing/            # Billing management
│   ├── customers/          # Customer management
│   ├── dashboard/          # Dashboard views
│   ├── purchase_orders/    # Purchase order handling
│   └── rate_cards/         # Rate card management
├── excis_billing/          # Django project settings
├── templates/              # HTML templates
├── static/                 # Static files (CSS, JS, images)
├── media/                  # User uploaded files
├── logs/                   # Application logs
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile             # Docker image definition
├── requirements.txt       # Python dependencies
└── entrypoint.sh         # Container startup script
```

## Database Schema

The application uses MySQL 8.0 with the following main models:

- **Customer**: Customer account information
- **BillingCycle**: Billing periods and cycles
- **PurchaseOrder**: Purchase order management
- **RateCard**: Pricing and rate structures
- **Invoice**: Generated invoices and billing

## API Endpoints

The application provides both web interface and API endpoints:

- `/admin/` - Django admin interface
- `/dashboard/` - Main dashboard
- `/customers/` - Customer management
- `/billing/` - Billing operations
- `/purchase-orders/` - Purchase order management
- `/rate-cards/` - Rate card management

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using port 8000
   lsof -i :8000

   # Kill the process or change port in docker-compose.yml
   ```

2. **Database Connection Issues**
   ```bash
   # Check if database container is running
   docker-compose ps

   # View database logs
   docker-compose logs db
   ```

3. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

4. **Container Won't Start**
   ```bash
   # Check container logs
   docker-compose logs web

   # Rebuild from scratch
   docker-compose down -v
   docker-compose up --build
   ```

### Logs

Application logs are stored in the `logs/` directory and can be viewed with:

```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View specific service logs
docker-compose logs web
```

## Production Deployment

For production deployment:

1. **Update Environment Variables**: Set production values in `.env`
2. **Use Production Database**: Consider using managed database services
3. **Configure Static Files**: Set up proper static file serving
4. **Set Up SSL**: Configure HTTPS for secure connections
5. **Monitor Logs**: Set up log monitoring and alerting
6. **Backup Strategy**: Implement regular database backups

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For support and questions, please contact the development team or create an issue in the repository.

## License

This project is proprietary software developed for Excis. All rights reserved.
