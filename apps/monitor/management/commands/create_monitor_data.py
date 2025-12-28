from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.monitor.models import BillingPipeline, PipelineStep, PipelineLog
from datetime import timedelta

class Command(BaseCommand):
    help = 'Creates sample data for the monitor app matching the reference design'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating sample data...')
        
        # Clear existing data
        BillingPipeline.objects.all().delete()
        
        # Create a pipeline
        pipeline = BillingPipeline.objects.create(
            name='January 2024 Billing Cycle',
            start_date=timezone.now().date(),
            end_date=timezone.now().date() + timedelta(days=30),
            status='in_progress',
            current_step_index=4, # Rate Match is index 3 (0-based) or 4 (1-based)
            progress_percentage=35
        )
        
        # Create steps matching changes/index.html
        steps_data = [
            {'id': '1', 'name': 'Trigger', 'order': 1, 'status': 'completed'},
            {'id': '2', 'name': 'Ingest', 'order': 2, 'status': 'completed'},
            {'id': '3', 'name': 'Validate', 'order': 3, 'status': 'completed'},
            {'id': '4', 'name': 'Rate Match', 'order': 4, 'status': 'in_progress'},
            {'id': '5', 'name': 'Compute', 'order': 5, 'status': 'pending'},
            {'id': '6', 'name': 'File Gen', 'order': 6, 'status': 'pending'},
            {'id': '7', 'name': 'Consolidate', 'order': 7, 'status': 'pending'},
            {'id': '8', 'name': 'Upload', 'order': 8, 'status': 'pending'},
            {'id': '9', 'name': 'Approval', 'order': 9, 'status': 'pending'},
            {'id': '10', 'name': 'Invoice', 'order': 10, 'status': 'pending'},
        ]
        
        for step_data in steps_data:
            step = PipelineStep.objects.create(
                pipeline=pipeline,
                name=step_data['name'],
                step_id=step_data['id'],
                order=step_data['order'],
                status=step_data['status']
            )
            
            # Add logs for completed/in-progress steps
            if step.status == 'completed':
                step.started_at = timezone.now() - timedelta(hours=2, minutes=step.order*10)
                step.completed_at = timezone.now() - timedelta(hours=2, minutes=step.order*10 - 5)
                step.save()
                
                PipelineLog.objects.create(
                    pipeline=pipeline,
                    step=step,
                    level='success',
                    message=f'{step.name} completed successfully.'
                )
            elif step.status == 'in_progress':
                step.started_at = timezone.now() - timedelta(minutes=10)
                step.save()
                
                PipelineLog.objects.create(
                    pipeline=pipeline,
                    step=step,
                    level='info',
                    message=f'Starting {step.name} process...'
                )
                PipelineLog.objects.create(
                    pipeline=pipeline,
                    step=step,
                    level='warning',
                    message=f'Manual intervention required for {step.name}.'
                )

        self.stdout.write(self.style.SUCCESS('Successfully created sample data matching reference design'))
