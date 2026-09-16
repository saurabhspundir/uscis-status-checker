```markdown
# Implementation Instructions: Invitation Code & Customer Tracking

## 1. Shared, Expiry-Based Invitation Code

Replace per-user invitation code checks with a single shared code stored in its own table.

### 1.1 New Entity
Create `api/Data/InvitationCode.cs`:
```csharp
public sealed class InvitationCode
{
    public Guid Id { get; set; }
    public Guid Code { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? ExpiresAt { get; set; } // null = active indefinitely
}
```

### 1.2 DbContext
In `api/Data/AppDbContext.cs`:
- Add `public DbSet<InvitationCode> InvitationCodes => Set<InvitationCode>();`
- Map table `invitation_codes`, key `Id`, unique index on `Code`.

### 1.3 Migration
- Add EF Core migration creating `invitation_codes` table.
- Seed one initial row (generate a `Guid` code, `ExpiresAt = null`).

### 1.4 Remove `InvitationCode` from `User`
- Remove `InvitationCode` property from `api/Data/User.cs`.
- Remove its mapping from `AppDbContext`.
- Add migration to drop the column from `users`.

### 1.5 Update `AuthEndpoints.cs` validation logic
Replace the current check:
```csharp
var codeExists = await db.Users.AnyAsync(u => u.InvitationCode == inviteGuid, ct);
```
With:
```csharp
var now = DateTimeOffset.UtcNow;
var codeValid = await db.InvitationCodes.AnyAsync(
    c => c.Code == inviteGuid && (c.ExpiresAt == null || c.ExpiresAt > now), ct);
```

### 1.6 Expiring the code
To invalidate immediately: `UPDATE invitation_codes SET "ExpiresAt" = now() WHERE "Code" = '<code>'`.
To issue a new code: insert a new row rather than overwriting the old one (keeps history).

---

## 2. Customer → User Conversion Tracking

Track prospects/leads separately from authenticated accounts, linked by email, converting on signup.

### 2.1 New Entity
Create `api/Data/Customer.cs`:
```csharp
public sealed class Customer
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Status { get; set; } = "interested"; // "interested" | "invited" | "converted"
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? InvitedAt { get; set; }
    public DateTimeOffset? ConvertedAt { get; set; }
    public Guid? ConvertedUserId { get; set; } // FK -> User.Id
}
```

### 2.2 DbContext
In `api/Data/AppDbContext.cs`:
- Add `public DbSet<Customer> Customers => Set<Customer>();`
- Map table `customers`, key `Id`, index on `Email`, optional FK `ConvertedUserId` → `users.Id` (nullable, no cascade delete).

### 2.3 Migration
- Add EF Core migration creating `customers` table.

### 2.4 Update `AuthEndpoints.cs` — conversion on new-user creation
After the existing new-user creation block (`db.Users.Add(newUser); await db.SaveChangesAsync(ct);`), add:
```csharp
var customer = await db.Customers.FirstOrDefaultAsync(c => c.Email == email, ct);
if (customer is not null && customer.ConvertedUserId is null)
{
    customer.Status = "converted";
    customer.ConvertedAt = DateTimeOffset.UtcNow;
    customer.ConvertedUserId = newUser.Id;
    await db.SaveChangesAsync(ct);
}
```

### 2.5 Managing Customer lifecycle (manual/admin, outside auth flow)
- Insert a `Customer` row (`Status = "interested"`) when someone expresses interest.
- Update `Status = "invited"`, set `InvitedAt`, when you invite them (independent of the shared invitation code above — this is your own tracking, not a gate).
- No action needed for conversion — it happens automatically on first successful login per 2.4.

### 2.6 Useful query: invited but not yet converted
```sql
SELECT * FROM customers WHERE "Status" = 'invited' AND "ConvertedUserId" IS NULL;
```

---

## Order of Work
1. Add `InvitationCode` entity + migration + seed row.
2. Update `AuthEndpoints.cs` invitation check (section 1.5).
3. Remove `InvitationCode` column from `User` + migration.
4. Add `Customer` entity + migration.
5. Add conversion logic to `AuthEndpoints.cs` (section 2.4).
6. Test: new signup with valid code → user created → matching `Customer` row (if any) marked converted.
```