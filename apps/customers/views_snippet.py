
@login_required
def get_account_details_api(request, pk):
    """Get full details for a specific account"""
    try:
        account = Account.objects.select_related(
            'customer', 'billing_cycle', 'currency', 'country'
        ).get(pk=pk)
        
        data = {
            'id': account.id,
            'customer': account.customer.id,
            'name': account.name,
            'account_id': account.account_id,
            'region': account.region.id if account.region else None,
            'country': account.country.id if account.country else None,
            'billing_cycle': account.billing_cycle.id if account.billing_cycle else None,
            'currency': account.currency.id if account.currency else None,
            'contact_email': account.contact_email,
            'contact_phone': account.contact_phone,
            'notes': account.notes,
        }
        return JsonResponse({'success': True, 'account': data})
    except Account.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Account not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching account details: {e}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@login_required
def update_account_api(request, pk):
    """Update account via AJAX"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)
        
    try:
        account = Account.objects.get(pk=pk)
        form = AccountForm(request.POST, instance=account)
        
        if form.is_valid():
            account = form.save()
            return JsonResponse({
                'success': True, 
                'message': 'Account updated successfully',
                'account': {
                    'id': account.id,
                    'name': account.name
                }
            })
        else:
            return JsonResponse({
                'success': False, 
                'errors': form.errors
            }, status=400)
            
    except Account.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Account not found'}, status=404)
    except Exception as e:
        logger.error(f"Error updating account: {e}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)
