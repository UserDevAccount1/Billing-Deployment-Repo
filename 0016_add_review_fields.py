from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    dependencies = [
        ('purchase_orders', '0015_remove_purchaseorder_purchase_or_uuid_7ca960_idx_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='purchaseorder',
            name='review_status',
            field=models.CharField(
                choices=[
                    ('approved', 'Approved'),
                    ('pending_review', 'Pending Review'),
                    ('rejected', 'Rejected'),
                    ('active', 'Active')
                ],
                default='active',
                max_length=20,
                blank=True,
                null=True
            ),
        ),
        migrations.AddField(
            model_name='purchaseorder',
            name='requires_review',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='purchaseorder',
            name='reviewed_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='purchaseorder',
            name='reviewed_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='reviewed_purchase_orders',
                to='auth.user',
            ),
        ),
        migrations.AddField(
            model_name='purchaseorder',
            name='review_notes',
            field=models.TextField(blank=True),
        ),
    ]