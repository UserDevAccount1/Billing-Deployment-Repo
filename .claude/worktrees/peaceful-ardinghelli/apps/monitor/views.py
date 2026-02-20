from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
import json
from .models import BillingPipeline, PipelineStep, PipelineLog

@login_required
def monitor_dashboard(request):
    return render(request, 'monitor/dev.html')

@login_required
def get_pipeline_status(request):
    """API to get the current status of the active pipeline"""
    # For now, get the most recent active or pending pipeline
    pipeline = BillingPipeline.objects.filter(
        status__in=['pending', 'in_progress', 'paused']
    ).order_by('-created_at').first()
    
    if not pipeline:
        # If no active pipeline, check for the last completed/failed one
        pipeline = BillingPipeline.objects.order_by('-created_at').first()
        
    if not pipeline:
        return JsonResponse({'status': 'no_data'})
        
    steps = pipeline.steps.all().order_by('order')
    
    data = {
        'id': pipeline.id,
        'name': pipeline.name,
        'status': pipeline.status,
        'progress': pipeline.progress_percentage,
        'current_step_index': pipeline.current_step_index,
        'steps': [{
            'id': step.step_id,
            'name': step.name,
            'status': step.status,
            'order': step.order,
            'started_at': step.started_at.isoformat() if step.started_at else None,
            'completed_at': step.completed_at.isoformat() if step.completed_at else None,
            'error': step.error_message
        } for step in steps]
    }
    
    return JsonResponse(data)

@csrf_exempt
@login_required
@require_http_methods(["POST"])
def control_pipeline(request):
    """API to control pipeline execution (play, pause, etc.)"""
    try:
        data = json.loads(request.body)
        action = data.get('action')
        pipeline_id = data.get('pipeline_id')
        
        if not action:
            return JsonResponse({'error': 'Action required'}, status=400)
            
        # Logic to handle actions would go here
        # For now, we'll just return success to simulate
        
        return JsonResponse({
            'status': 'success', 
            'message': f'Action {action} received',
            'action': action
        })
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

@login_required
def get_pipeline_logs(request):
    """API to fetch recent logs"""
    pipeline_id = request.GET.get('pipeline_id')
    
    if pipeline_id:
        logs = PipelineLog.objects.filter(pipeline_id=pipeline_id)
    else:
        logs = PipelineLog.objects.all()
        
    logs = logs.order_by('-timestamp')[:50] # Last 50 logs
    
    data = [{
        'timestamp': log.timestamp.strftime('%H:%M:%S'),
        'level': log.level,
        'message': log.message,
        'step': log.step.name if log.step else 'System'
    } for log in logs]
    
    return JsonResponse({'logs': data})
