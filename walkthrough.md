# LearnerDashboard Mark as Returned Fix

## Issue
The user pointed out that the "Mark as Returned" button was visible for all rentals in the "Current Rentals" list, regardless of their status.
This meant users could potentially mark a "Pending" or "Ready for Pickup" rental as returned, which is logically incorrect as they haven't picked up the instrument yet.

## Solution
Restricted the visibility of the "Mark as Returned" button to **only** rentals with `status === 'active'`.

## Code Change
**File**: `frontend/components/LearnerDashboard.tsx`

**Before**:
```tsx
{/* Mark as Returned Button */}
<div className="flex gap-2 pt-3 border-t mt-3">
  <Button ...>Mark as Returned</Button>
  ...
</div>
```

**After**:
```tsx
{/* Mark as Returned Button - Only for active rentals */}
{rental.status === 'active' && (
  <div className="flex gap-2 pt-3 border-t mt-3">
    <Button ...>Mark as Returned</Button>
    ...
  </div>
)}
```

## Result
- ✅ **Pending Approval**: Button is HIDDEN.
- ✅ **Ready for Pickup**: Button is HIDDEN.
- ✅ **Active**: Button is **VISIBLE**.
- ✅ **Logic**: Users can only return instruments they currently possess.

## Files Modified
- `frontend/components/LearnerDashboard.tsx`
