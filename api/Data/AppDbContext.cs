using Microsoft.EntityFrameworkCore;
using UscisApi.Data;

namespace UscisApi;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<InvitationCode> InvitationCodes => Set<InvitationCode>();
    public DbSet<Customer> Customers => Set<Customer>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasKey(u => u.Id);
            e.Property(u => u.Id).HasColumnName("Id");
            e.Property(u => u.ExternalId).HasColumnName("ExternalId");
            e.Property(u => u.Provider).HasColumnName("Provider");
            e.Property(u => u.Email).HasColumnName("Email");
            e.Property(u => u.DisplayName).HasColumnName("DisplayName");
            e.Property(u => u.AvatarUrl).HasColumnName("AvatarUrl");
            e.Property(u => u.IsAdmin).HasColumnName("IsAdmin");
            e.Property(u => u.CreatedAt).HasColumnName("CreatedAt");
            e.Property(u => u.UpdatedAt).HasColumnName("UpdatedAt");
            e.HasIndex(u => new { u.ExternalId, u.Provider }).IsUnique();
        });

        builder.Entity<InvitationCode>(e =>
        {
            e.ToTable("invitation_codes");
            e.HasKey(ic => ic.Id);
            e.Property(ic => ic.Id).HasColumnName("Id");
            e.Property(ic => ic.Code).HasColumnName("Code");
            e.Property(ic => ic.CreatedAt).HasColumnName("CreatedAt");
            e.Property(ic => ic.ExpiresAt).HasColumnName("ExpiresAt");
            e.HasIndex(ic => ic.Code).IsUnique();
        });

        builder.Entity<Customer>(e =>
        {
            e.ToTable("customers");
            e.HasKey(c => c.Id);
            e.Property(c => c.Id).HasColumnName("Id");
            e.Property(c => c.Email).HasColumnName("Email");
            e.Property(c => c.Status).HasColumnName("Status");
            e.Property(c => c.CreatedAt).HasColumnName("CreatedAt");
            e.Property(c => c.InvitedAt).HasColumnName("InvitedAt");
            e.Property(c => c.ConvertedAt).HasColumnName("ConvertedAt");
            e.Property(c => c.ConvertedUserId).HasColumnName("ConvertedUserId");
            e.HasIndex(c => c.Email);
            e.HasOne<User>()
             .WithMany()
             .HasForeignKey(c => c.ConvertedUserId)
             .IsRequired(false)
             .OnDelete(DeleteBehavior.NoAction);
        });
    }
}
