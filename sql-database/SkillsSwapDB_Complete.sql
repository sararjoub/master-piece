/* SKILLS SWAP — COMPLETE SQL SERVER DELIVERY | 2026-11-03
   SSMS: run this whole file using Execute (F5) on a SQL Server 2019+ instance.
   WARNING: Designed for a NEW database. If SkillsSwapDB already exists with
   tables, this script stops. It does NOT delete existing data.
   Demo users are display-only (PasswordHash NULL); create real login accounts
   with ASP.NET Core Identity UserManager/PasswordHasher in the MVC backend.
   GO is an SSMS batch separator, needed here for database creation and for
   safe separation of individual source scripts. It is NOT T-SQL.
   This assembled script has NOT yet been executed on a clean SQL Server.
*/
USE [master];
GO
IF DB_ID(N'SkillsSwapDB') IS NULL
    EXEC(N'CREATE DATABASE [SkillsSwapDB]');
GO


-- ===== 01: TABLES, CONSTRAINTS, INDEXES =====
/* Skills Swap | SQL Server 2019+ | fresh database | 46 tables | no GO
   Identity-compatible table names and default EF Core Identity columns.
   IMPORTANT: configure ASP.NET Core Identity mappings/migrations against this existing schema;
   do NOT apply an initial migration that attempts to CREATE these same tables again.
   All timestamps UTC. No test users, card data, or secrets. */
SET NOCOUNT ON;
USE [SkillsSwapDB];
SET XACT_ABORT ON;
IF OBJECT_ID(N'dbo.AspNetUsers', N'U') IS NOT NULL THROW 51000, 'SkillsSwapDB already has tables. Run only against a new/empty database.', 1;
BEGIN TRANSACTION;
-- MODULE 01: standard ASP.NET Core Identity schema (string-key IdentityUser / IdentityRole)
CREATE TABLE dbo.AspNetUsers (
 Id NVARCHAR(450) NOT NULL CONSTRAINT PK_AspNetUsers PRIMARY KEY,
 UserName NVARCHAR(256) NULL, NormalizedUserName NVARCHAR(256) NULL,
 Email NVARCHAR(256) NULL, NormalizedEmail NVARCHAR(256) NULL,
 EmailConfirmed BIT NOT NULL, PasswordHash NVARCHAR(MAX) NULL,
 SecurityStamp NVARCHAR(MAX) NULL, ConcurrencyStamp NVARCHAR(MAX) NULL,
 PhoneNumber NVARCHAR(MAX) NULL, PhoneNumberConfirmed BIT NOT NULL,
 TwoFactorEnabled BIT NOT NULL, LockoutEnd DATETIMEOFFSET(7) NULL,
 LockoutEnabled BIT NOT NULL, AccessFailedCount INT NOT NULL,
 CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Users_Created DEFAULT SYSUTCDATETIME(),
 UpdatedAt DATETIME2(3) NULL, IsActive BIT NOT NULL CONSTRAINT DF_Users_Active DEFAULT (1),
 CONSTRAINT CK_Users_AccessFailed CHECK (AccessFailedCount >= 0)
);
CREATE UNIQUE INDEX UserNameIndex ON dbo.AspNetUsers(NormalizedUserName) WHERE NormalizedUserName IS NOT NULL;
CREATE INDEX EmailIndex ON dbo.AspNetUsers(NormalizedEmail);
CREATE TABLE dbo.AspNetRoles (
 Id NVARCHAR(450) NOT NULL CONSTRAINT PK_AspNetRoles PRIMARY KEY,
 Name NVARCHAR(256) NULL, NormalizedName NVARCHAR(256) NULL, ConcurrencyStamp NVARCHAR(MAX) NULL
);
CREATE UNIQUE INDEX RoleNameIndex ON dbo.AspNetRoles(NormalizedName) WHERE NormalizedName IS NOT NULL;
CREATE TABLE dbo.AspNetUserRoles (
 UserId NVARCHAR(450) NOT NULL, RoleId NVARCHAR(450) NOT NULL,
 CONSTRAINT PK_AspNetUserRoles PRIMARY KEY(UserId,RoleId),
 CONSTRAINT FK_UserRoles_User FOREIGN KEY(UserId) REFERENCES dbo.AspNetUsers(Id) ON DELETE CASCADE,
 CONSTRAINT FK_UserRoles_Role FOREIGN KEY(RoleId) REFERENCES dbo.AspNetRoles(Id) ON DELETE CASCADE
);
CREATE INDEX IX_UserRoles_Role ON dbo.AspNetUserRoles(RoleId);
CREATE TABLE dbo.AspNetUserClaims (
 Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_AspNetUserClaims PRIMARY KEY,
 UserId NVARCHAR(450) NOT NULL, ClaimType NVARCHAR(MAX) NULL, ClaimValue NVARCHAR(MAX) NULL,
 CONSTRAINT FK_UserClaims_User FOREIGN KEY(UserId) REFERENCES dbo.AspNetUsers(Id) ON DELETE CASCADE
);
CREATE INDEX IX_UserClaims_User ON dbo.AspNetUserClaims(UserId);
CREATE TABLE dbo.AspNetRoleClaims (
 Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_AspNetRoleClaims PRIMARY KEY,
 RoleId NVARCHAR(450) NOT NULL, ClaimType NVARCHAR(MAX) NULL, ClaimValue NVARCHAR(MAX) NULL,
 CONSTRAINT FK_RoleClaims_Role FOREIGN KEY(RoleId) REFERENCES dbo.AspNetRoles(Id) ON DELETE CASCADE
);
CREATE INDEX IX_RoleClaims_Role ON dbo.AspNetRoleClaims(RoleId);
CREATE TABLE dbo.AspNetUserLogins (
 LoginProvider NVARCHAR(128) NOT NULL, ProviderKey NVARCHAR(128) NOT NULL,
 ProviderDisplayName NVARCHAR(MAX) NULL, UserId NVARCHAR(450) NOT NULL,
 CONSTRAINT PK_AspNetUserLogins PRIMARY KEY(LoginProvider,ProviderKey),
 CONSTRAINT FK_UserLogins_User FOREIGN KEY(UserId) REFERENCES dbo.AspNetUsers(Id) ON DELETE CASCADE
);
CREATE INDEX IX_UserLogins_User ON dbo.AspNetUserLogins(UserId);
CREATE TABLE dbo.AspNetUserTokens (
 UserId NVARCHAR(450) NOT NULL, LoginProvider NVARCHAR(128) NOT NULL,
 Name NVARCHAR(128) NOT NULL, Value NVARCHAR(MAX) NULL,
 CONSTRAINT PK_AspNetUserTokens PRIMARY KEY(UserId,LoginProvider,Name),
 CONSTRAINT FK_UserTokens_User FOREIGN KEY(UserId) REFERENCES dbo.AspNetUsers(Id) ON DELETE CASCADE
);
CREATE TABLE dbo.UserProfiles (
 UserId NVARCHAR(450) NOT NULL CONSTRAINT PK_UserProfiles PRIMARY KEY,
 FullName NVARCHAR(150) NOT NULL, Bio NVARCHAR(2000) NULL,
 Location NVARCHAR(200) NULL, AvatarUrl NVARCHAR(2048) NULL,
 LinkedInUrl NVARCHAR(2048) NULL, GitHubUrl NVARCHAR(2048) NULL, WebsiteUrl NVARCHAR(2048) NULL,
 ProfileCompletedAt DATETIME2(3) NULL,
 CONSTRAINT FK_Profiles_User FOREIGN KEY(UserId) REFERENCES dbo.AspNetUsers(Id)
);
CREATE TABLE dbo.UserAvailability (
 AvailabilityId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_UserAvailability PRIMARY KEY,
 UserId NVARCHAR(450) NOT NULL, DayOfWeek TINYINT NOT NULL,
 StartTime TIME(0) NOT NULL, EndTime TIME(0) NOT NULL, TimeZoneId NVARCHAR(100) NOT NULL,
 CONSTRAINT FK_Availability_User FOREIGN KEY(UserId) REFERENCES dbo.AspNetUsers(Id),
 CONSTRAINT CK_Availability_Day CHECK (DayOfWeek BETWEEN 0 AND 6),
 CONSTRAINT CK_Availability_Times CHECK (StartTime < EndTime),
 CONSTRAINT UQ_Availability_Slot UNIQUE(UserId,DayOfWeek,StartTime,EndTime)
);
-- MODULE 02: taxonomy
CREATE TABLE dbo.Categories (
 CategoryId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Categories PRIMARY KEY,
 Name NVARCHAR(100) NOT NULL, Slug VARCHAR(120) NOT NULL,
 Description NVARCHAR(500) NULL, Icon NVARCHAR(200) NULL,
 IsActive BIT NOT NULL CONSTRAINT DF_Categories_Active DEFAULT(1),
 DisplayOrder INT NOT NULL CONSTRAINT DF_Categories_Order DEFAULT(0),
 CONSTRAINT UQ_Categories_Name UNIQUE(Name), CONSTRAINT UQ_Categories_Slug UNIQUE(Slug)
);
CREATE TABLE dbo.SubCategories (
 SubCategoryId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_SubCategories PRIMARY KEY,
 CategoryId INT NOT NULL, Name NVARCHAR(100) NOT NULL, Slug VARCHAR(120) NOT NULL,
 Description NVARCHAR(500) NULL, IsActive BIT NOT NULL CONSTRAINT DF_SubCategories_Active DEFAULT(1),
 DisplayOrder INT NOT NULL CONSTRAINT DF_SubCategories_Order DEFAULT(0),
 CONSTRAINT FK_SubCategories_Category FOREIGN KEY(CategoryId) REFERENCES dbo.Categories(CategoryId),
 CONSTRAINT UQ_SubCategories_Slug UNIQUE(CategoryId,Slug)
);
CREATE TABLE dbo.Skills (
 SkillId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Skills PRIMARY KEY,
 SubCategoryId INT NOT NULL, Name NVARCHAR(120) NOT NULL, Slug VARCHAR(140) NOT NULL,
 Description NVARCHAR(1000) NULL, Level VARCHAR(20) NULL, AccessTier VARCHAR(20) NOT NULL CONSTRAINT DF_Skills_Tier DEFAULT('Basic'),
 Icon NVARCHAR(200) NULL, EstimatedDurationHours INT NULL, Requirements NVARCHAR(2000) NULL,
 IsActive BIT NOT NULL CONSTRAINT DF_Skills_Active DEFAULT(1),
 CONSTRAINT FK_Skills_SubCategory FOREIGN KEY(SubCategoryId) REFERENCES dbo.SubCategories(SubCategoryId),
 CONSTRAINT UQ_Skills_Slug UNIQUE(Slug),
 CONSTRAINT CK_Skills_Level CHECK (Level IS NULL OR Level IN ('Beginner','Intermediate','Advanced','Expert')),
 CONSTRAINT CK_Skills_Tier CHECK (AccessTier IN ('Basic','Advanced')),
 CONSTRAINT CK_Skills_Duration CHECK (EstimatedDurationHours IS NULL OR EstimatedDurationHours > 0)
);
CREATE INDEX IX_Skills_SubCategory ON dbo.Skills(SubCategoryId);
CREATE TABLE dbo.UserSkills (
 UserSkillId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_UserSkills PRIMARY KEY,
 UserId NVARCHAR(450) NOT NULL, SkillId INT NOT NULL, Intent VARCHAR(10) NOT NULL,
 ProficiencyLevel VARCHAR(20) NULL, ExperienceMonths INT NULL,
 Description NVARCHAR(1000) NULL,
 CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_UserSkills_Created DEFAULT SYSUTCDATETIME(),
 UpdatedAt DATETIME2(3) NULL,
 CONSTRAINT FK_UserSkills_User FOREIGN KEY(UserId) REFERENCES dbo.AspNetUsers(Id),
 CONSTRAINT FK_UserSkills_Skill FOREIGN KEY(SkillId) REFERENCES dbo.Skills(SkillId),
 CONSTRAINT UQ_UserSkills_UserSkillIntent UNIQUE(UserId,SkillId,Intent),
 CONSTRAINT UQ_UserSkills_IdOwnerIntent UNIQUE(UserSkillId,UserId,Intent),
 CONSTRAINT CK_UserSkills_Intent CHECK(Intent IN ('Teach','Learn')),
 CONSTRAINT CK_UserSkills_Level CHECK(ProficiencyLevel IS NULL OR ProficiencyLevel IN ('Beginner','Intermediate','Advanced','Expert')),
 CONSTRAINT CK_UserSkills_Experience CHECK(ExperienceMonths IS NULL OR ExperienceMonths >= 0)
);
CREATE INDEX IX_UserSkills_Discover ON dbo.UserSkills(SkillId,Intent);
CREATE TABLE dbo.SkillLearningOutcomes (
 OutcomeId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_SkillLearningOutcomes PRIMARY KEY,
 SkillId INT NOT NULL, Description NVARCHAR(500) NOT NULL, DisplayOrder INT NOT NULL,
 CONSTRAINT FK_Outcomes_Skill FOREIGN KEY(SkillId) REFERENCES dbo.Skills(SkillId),
 CONSTRAINT UQ_Outcomes_Order UNIQUE(SkillId,DisplayOrder),
 CONSTRAINT CK_Outcomes_Order CHECK(DisplayOrder > 0)
);
-- MODULE 04 foundations (courses reference milestones, resources reference courses)
CREATE TABLE dbo.CareerPaths (
 CareerPathId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_CareerPaths PRIMARY KEY,
 Title NVARCHAR(150) NOT NULL, Slug VARCHAR(170) NOT NULL,
 Description NVARCHAR(2000) NULL, ImageUrl NVARCHAR(2048) NULL,
 DifficultyLevel VARCHAR(20) NULL,
 IsPublished BIT NOT NULL CONSTRAINT DF_CareerPaths_Published DEFAULT(0),
 DisplayOrder INT NOT NULL CONSTRAINT DF_CareerPaths_Order DEFAULT(0),
 CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_CareerPaths_Created DEFAULT SYSUTCDATETIME(), UpdatedAt DATETIME2(3) NULL,
 CONSTRAINT UQ_CareerPaths_Slug UNIQUE(Slug),
 CONSTRAINT CK_CareerPaths_Difficulty CHECK(DifficultyLevel IS NULL OR DifficultyLevel IN ('Beginner','Intermediate','Advanced','Expert'))
);
CREATE TABLE dbo.CareerMilestones (
 MilestoneId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_CareerMilestones PRIMARY KEY,
 CareerPathId INT NOT NULL, Title NVARCHAR(150) NOT NULL,
 Description NVARCHAR(1000) NULL, SequenceNo INT NOT NULL, EstimatedHours INT NULL,
 CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Milestones_Created DEFAULT SYSUTCDATETIME(),
 CONSTRAINT FK_Milestones_Path FOREIGN KEY(CareerPathId) REFERENCES dbo.CareerPaths(CareerPathId),
 CONSTRAINT UQ_Milestones_Order UNIQUE(CareerPathId,SequenceNo),
 CONSTRAINT UQ_Milestones_IdPath UNIQUE(MilestoneId,CareerPathId),
 CONSTRAINT CK_Milestones_Order CHECK(SequenceNo > 0),
 CONSTRAINT CK_Milestones_Hours CHECK(EstimatedHours IS NULL OR EstimatedHours > 0)
);
CREATE TABLE dbo.MilestoneSkills (
 MilestoneId INT NOT NULL, SkillId INT NOT NULL,
 CONSTRAINT PK_MilestoneSkills PRIMARY KEY(MilestoneId,SkillId),
 CONSTRAINT FK_MilestoneSkills_Milestone FOREIGN KEY(MilestoneId) REFERENCES dbo.CareerMilestones(MilestoneId),
 CONSTRAINT FK_MilestoneSkills_Skill FOREIGN KEY(SkillId) REFERENCES dbo.Skills(SkillId)
);
CREATE INDEX IX_MilestoneSkills_Skill ON dbo.MilestoneSkills(SkillId);
CREATE TABLE dbo.UserCareerPaths (
 EnrollmentId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_UserCareerPaths PRIMARY KEY,
 UserId NVARCHAR(450) NOT NULL, CareerPathId INT NOT NULL,
 Status VARCHAR(20) NOT NULL CONSTRAINT DF_UserPaths_Status DEFAULT('InProgress'),
 StartedAt DATETIME2(3) NOT NULL CONSTRAINT DF_UserPaths_Started DEFAULT SYSUTCDATETIME(),
 CompletedAt DATETIME2(3) NULL,
 CONSTRAINT FK_UserPaths_User FOREIGN KEY(UserId) REFERENCES dbo.AspNetUsers(Id),
 CONSTRAINT FK_UserPaths_Path FOREIGN KEY(CareerPathId) REFERENCES dbo.CareerPaths(CareerPathId),
 CONSTRAINT UQ_UserPaths_UserPath UNIQUE(UserId,CareerPathId),
 CONSTRAINT UQ_UserPaths_IdPath UNIQUE(EnrollmentId,CareerPathId),
 CONSTRAINT CK_UserPaths_Status CHECK(Status IN ('InProgress','Completed','Paused','Cancelled')),
 CONSTRAINT CK_UserPaths_Completed CHECK(CompletedAt IS NULL OR CompletedAt >= StartedAt)
);
CREATE TABLE dbo.UserMilestoneProgress (
 EnrollmentId INT NOT NULL, MilestoneId INT NOT NULL, CareerPathId INT NOT NULL,
 Status VARCHAR(20) NOT NULL CONSTRAINT DF_MilestoneProgress_Status DEFAULT('NotStarted'),
 StartedAt DATETIME2(3) NULL, CompletedAt DATETIME2(3) NULL,
 CONSTRAINT PK_UserMilestoneProgress PRIMARY KEY(EnrollmentId,MilestoneId),
 CONSTRAINT FK_MilestoneProgress_EnrollmentPath FOREIGN KEY(EnrollmentId,CareerPathId) REFERENCES dbo.UserCareerPaths(EnrollmentId,CareerPathId),
 CONSTRAINT FK_MilestoneProgress_MilestonePath FOREIGN KEY(MilestoneId,CareerPathId) REFERENCES dbo.CareerMilestones(MilestoneId,CareerPathId),
 CONSTRAINT CK_MilestoneProgress_Status CHECK(Status IN ('NotStarted','InProgress','Completed')),
 CONSTRAINT CK_MilestoneProgress_Dates CHECK(CompletedAt IS NULL OR (StartedAt IS NOT NULL AND CompletedAt >= StartedAt))
);
CREATE INDEX IX_MilestoneProgress_MilestonePath ON dbo.UserMilestoneProgress(MilestoneId,CareerPathId);
CREATE TABLE dbo.LearningPreferences (
 UserId NVARCHAR(450) NOT NULL CONSTRAINT PK_LearningPreferences PRIMARY KEY,
 CurrentLevel VARCHAR(20) NULL, WeeklyHours INT NULL, LearningStyle VARCHAR(30) NULL,
 CareerGoal NVARCHAR(500) NULL,
 UpdatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_LearningPreferences_Updated DEFAULT SYSUTCDATETIME(),
 CONSTRAINT FK_LearningPreferences_User FOREIGN KEY(UserId) REFERENCES dbo.AspNetUsers(Id),
 CONSTRAINT CK_LearningPreferences_Level CHECK(CurrentLevel IS NULL OR CurrentLevel IN ('Beginner','Intermediate','Advanced','Expert')),
 CONSTRAINT CK_LearningPreferences_Hours CHECK(WeeklyHours IS NULL OR WeeklyHours BETWEEN 1 AND 168)
);
-- MODULE 07 courses
CREATE TABLE dbo.Courses (
 CourseId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Courses PRIMARY KEY,
 InstructorUserId NVARCHAR(450) NOT NULL, SkillId INT NOT NULL,
 Title NVARCHAR(200) NOT NULL, Description NVARCHAR(MAX) NULL,
 Level VARCHAR(20) NOT NULL CONSTRAINT DF_Courses_Level DEFAULT('Beginner'),
 Status VARCHAR(20) NOT NULL CONSTRAINT DF_Courses_Status DEFAULT('Draft'),
 ThumbnailUrl NVARCHAR(2048) NULL,
 CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Courses_Created DEFAULT SYSUTCDATETIME(),
 PublishedAt DATETIME2(3) NULL,
 CONSTRAINT FK_Courses_Instructor FOREIGN KEY(InstructorUserId) REFERENCES dbo.AspNetUsers(Id),
 CONSTRAINT FK_Courses_Skill FOREIGN KEY(SkillId) REFERENCES dbo.Skills(SkillId),
 CONSTRAINT CK_Courses_Level CHECK(Level IN ('Beginner','Intermediate','Advanced','Expert')),
 CONSTRAINT CK_Courses_Status CHECK(Status IN ('Draft','InReview','Published','Archived'))
);
CREATE INDEX IX_Courses_SkillStatus ON dbo.Courses(SkillId,Status);
CREATE TABLE dbo.CourseLessons (
 LessonId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_CourseLessons PRIMARY KEY,
 CourseId INT NOT NULL, Title NVARCHAR(200) NOT NULL,
 Content NVARCHAR(MAX) NULL, ContentUrl NVARCHAR(2048) NULL,
 LessonOrder INT NOT NULL, DurationMinutes INT NULL,
 IsPublished BIT NOT NULL CONSTRAINT DF_Lessons_Published DEFAULT(0),
 CONSTRAINT FK_Lessons_Course FOREIGN KEY(CourseId) REFERENCES dbo.Courses(CourseId),
 CONSTRAINT UQ_Lessons_Order UNIQUE(CourseId,LessonOrder),
 CONSTRAINT UQ_Lessons_IdCourse UNIQUE(LessonId,CourseId),
 CONSTRAINT CK_Lessons_Order CHECK(LessonOrder > 0),
 CONSTRAINT CK_Lessons_Duration CHECK(DurationMinutes IS NULL OR DurationMinutes > 0)
);
CREATE TABLE dbo.CourseEnrollments (
 EnrollmentId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_CourseEnrollments PRIMARY KEY,
 CourseId INT NOT NULL, UserId NVARCHAR(450) NOT NULL,
 Status VARCHAR(20) NOT NULL CONSTRAINT DF_CourseEnrollments_Status DEFAULT('Enrolled'),
 EnrolledAt DATETIME2(3) NOT NULL CONSTRAINT DF_CourseEnrollments_At DEFAULT SYSUTCDATETIME(),
 CompletedAt DATETIME2(3) NULL,
 CONSTRAINT FK_CourseEnrollments_Course FOREIGN KEY(CourseId) REFERENCES dbo.Courses(CourseId),
 CONSTRAINT FK_CourseEnrollments_User FOREIGN KEY(UserId) REFERENCES dbo.AspNetUsers(Id),
 CONSTRAINT UQ_CourseEnrollments_UserCourse UNIQUE(UserId,CourseId),
 CONSTRAINT UQ_CourseEnrollments_IdCourse UNIQUE(EnrollmentId,CourseId),
 CONSTRAINT CK_CourseEnrollments_Status CHECK(Status IN ('Enrolled','InProgress','Completed','Cancelled')),
 CONSTRAINT CK_CourseEnrollments_Dates CHECK(CompletedAt IS NULL OR CompletedAt >= EnrolledAt)
);
CREATE INDEX IX_CourseEnrollments_Course ON dbo.CourseEnrollments(CourseId);
CREATE TABLE dbo.UserLessonProgress (
 EnrollmentId INT NOT NULL, LessonId INT NOT NULL, CourseId INT NOT NULL,
 Status VARCHAR(20) NOT NULL CONSTRAINT DF_LessonProgress_Status DEFAULT('NotStarted'),
 StartedAt DATETIME2(3) NULL, CompletedAt DATETIME2(3) NULL,
 CONSTRAINT PK_UserLessonProgress PRIMARY KEY(EnrollmentId,LessonId),
 CONSTRAINT FK_LessonProgress_EnrollmentCourse FOREIGN KEY(EnrollmentId,CourseId) REFERENCES dbo.CourseEnrollments(EnrollmentId,CourseId),
 CONSTRAINT FK_LessonProgress_LessonCourse FOREIGN KEY(LessonId,CourseId) REFERENCES dbo.CourseLessons(LessonId,CourseId),
 CONSTRAINT CK_LessonProgress_Status CHECK(Status IN ('NotStarted','InProgress','Completed')),
 CONSTRAINT CK_LessonProgress_Dates CHECK(CompletedAt IS NULL OR (StartedAt IS NOT NULL AND CompletedAt >= StartedAt))
);
CREATE INDEX IX_LessonProgress_LessonCourse ON dbo.UserLessonProgress(LessonId,CourseId);
CREATE TABLE dbo.MilestoneResources (
 ResourceId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_MilestoneResources PRIMARY KEY,
 MilestoneId INT NOT NULL, CourseId INT NULL, Title NVARCHAR(200) NOT NULL,
 ExternalUrl NVARCHAR(2048) NULL, ResourceOrder INT NOT NULL,
 CONSTRAINT FK_Resources_Milestone FOREIGN KEY(MilestoneId) REFERENCES dbo.CareerMilestones(MilestoneId),
 CONSTRAINT FK_Resources_Course FOREIGN KEY(CourseId) REFERENCES dbo.Courses(CourseId),
 CONSTRAINT UQ_Resources_Order UNIQUE(MilestoneId,ResourceOrder),
 CONSTRAINT CK_Resources_Target CHECK ((CourseId IS NOT NULL AND ExternalUrl IS NULL) OR (CourseId IS NULL AND ExternalUrl IS NOT NULL)),
 CONSTRAINT CK_Resources_Order CHECK(ResourceOrder > 0)
);
CREATE INDEX IX_Resources_Course ON dbo.MilestoneResources(CourseId) WHERE CourseId IS NOT NULL;
-- MODULE 05 billing & experts (created before swap because conversations reference bookings)
CREATE TABLE dbo.SubscriptionPlans (
 PlanId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_SubscriptionPlans PRIMARY KEY,
 Code VARCHAR(30) NOT NULL, Name NVARCHAR(100) NOT NULL,
 Description NVARCHAR(1000) NULL, Price DECIMAL(10,2) NOT NULL,
 Currency CHAR(3) NOT NULL CONSTRAINT DF_Plans_Currency DEFAULT('JOD'),
 BillingPeriod VARCHAR(20) NOT NULL,
 IsActive BIT NOT NULL CONSTRAINT DF_Plans_Active DEFAULT(1),
 DisplayOrder INT NOT NULL CONSTRAINT DF_Plans_Order DEFAULT(0),
 CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Plans_Created DEFAULT SYSUTCDATETIME(),
 CONSTRAINT UQ_Plans_Code UNIQUE(Code),
 CONSTRAINT CK_Plans_Price CHECK(Price >= 0),
 CONSTRAINT CK_Plans_Billing CHECK(BillingPeriod IN ('None','Monthly','Yearly')),
 CONSTRAINT CK_Plans_Free CHECK((BillingPeriod='None' AND Price=0) OR BillingPeriod <> 'None')
);
CREATE TABLE dbo.Features (
 FeatureId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Features PRIMARY KEY,
 Code VARCHAR(60) NOT NULL, Name NVARCHAR(120) NOT NULL,
 Description NVARCHAR(500) NULL,
 IsActive BIT NOT NULL CONSTRAINT DF_Features_Active DEFAULT(1),
 CONSTRAINT UQ_Features_Code UNIQUE(Code)
);
CREATE TABLE dbo.PlanFeatures (
 PlanId INT NOT NULL, FeatureId INT NOT NULL,
 IsEnabled BIT NOT NULL, UsageLimit INT NULL,
 CONSTRAINT PK_PlanFeatures PRIMARY KEY(PlanId,FeatureId),
 CONSTRAINT FK_PlanFeatures_Plan FOREIGN KEY(PlanId) REFERENCES dbo.SubscriptionPlans(PlanId),
 CONSTRAINT FK_PlanFeatures_Feature FOREIGN KEY(FeatureId) REFERENCES dbo.Features(FeatureId),
 CONSTRAINT CK_PlanFeatures_Limit CHECK(UsageLimit IS NULL OR UsageLimit >= 0)
);
CREATE INDEX IX_PlanFeatures_Feature ON dbo.PlanFeatures(FeatureId);
CREATE TABLE dbo.UserSubscriptions (
 SubscriptionId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_UserSubscriptions PRIMARY KEY,
 UserId NVARCHAR(450) NOT NULL, PlanId INT NOT NULL,
 Status VARCHAR(20) NOT NULL CONSTRAINT DF_Subscriptions_Status DEFAULT('Pending'),
 StartAt DATETIME2(3) NOT NULL, EndAt DATETIME2(3) NULL,
 TrialEndsAt DATETIME2(3) NULL, CancelledAt DATETIME2(3) NULL,
 CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Subscriptions_Created DEFAULT SYSUTCDATETIME(),
 CONSTRAINT FK_Subscriptions_User FOREIGN KEY(UserId) REFERENCES dbo.AspNetUsers(Id),
 CONSTRAINT FK_Subscriptions_Plan FOREIGN KEY(PlanId) REFERENCES dbo.SubscriptionPlans(PlanId),
 CONSTRAINT CK_Subscriptions_Status CHECK(Status IN ('Pending','Trialing','Active','Cancelled','Expired')),
 CONSTRAINT CK_Subscriptions_Period CHECK(EndAt IS NULL OR EndAt > StartAt),
 CONSTRAINT CK_Subscriptions_Trial CHECK(TrialEndsAt IS NULL OR TrialEndsAt > StartAt),
 CONSTRAINT CK_Subscriptions_Cancel CHECK(CancelledAt IS NULL OR CancelledAt >= StartAt)
);
CREATE UNIQUE INDEX UX_Subscriptions_Current ON dbo.UserSubscriptions(UserId) WHERE Status IN ('Active','Trialing');
CREATE INDEX IX_Subscriptions_UserStatus ON dbo.UserSubscriptions(UserId,Status);
CREATE TABLE dbo.ExpertProfiles (
 UserId NVARCHAR(450) NOT NULL CONSTRAINT PK_ExpertProfiles PRIMARY KEY,
 Headline NVARCHAR(200) NOT NULL, Biography NVARCHAR(2000) NULL,
 HourlyRate DECIMAL(10,2) NOT NULL, Currency CHAR(3) NOT NULL CONSTRAINT DF_Experts_Currency DEFAULT('JOD'),
 VerificationStatus VARCHAR(20) NOT NULL CONSTRAINT DF_Experts_Status DEFAULT('Pending'),
 VerifiedAt DATETIME2(3) NULL,
 CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Experts_Created DEFAULT SYSUTCDATETIME(), UpdatedAt DATETIME2(3) NULL,
 CONSTRAINT FK_Experts_User FOREIGN KEY(UserId) REFERENCES dbo.AspNetUsers(Id),
 CONSTRAINT CK_Experts_Rate CHECK(HourlyRate >= 0),
 CONSTRAINT CK_Experts_Status CHECK(VerificationStatus IN ('Pending','Approved','Rejected','Suspended'))
);
CREATE INDEX IX_Experts_Status ON dbo.ExpertProfiles(VerificationStatus);
CREATE TABLE dbo.ExpertBookings (
 ExpertBookingId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ExpertBookings PRIMARY KEY,
 ExpertUserId NVARCHAR(450) NOT NULL, LearnerUserId NVARCHAR(450) NOT NULL,
 ScheduledStartAt DATETIME2(3) NOT NULL, ScheduledEndAt DATETIME2(3) NOT NULL,
 AgreedPrice DECIMAL(10,2) NOT NULL, Currency CHAR(3) NOT NULL,
 Status VARCHAR(20) NOT NULL CONSTRAINT DF_Bookings_Status DEFAULT('PendingPayment'),
 Notes NVARCHAR(1000) NULL,
 CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Bookings_Created DEFAULT SYSUTCDATETIME(), CancelledAt DATETIME2(3) NULL,
 CONSTRAINT FK_Bookings_Expert FOREIGN KEY(ExpertUserId) REFERENCES dbo.ExpertProfiles(UserId),
 CONSTRAINT FK_Bookings_Learner FOREIGN KEY(LearnerUserId) REFERENCES dbo.AspNetUsers(Id),
 CONSTRAINT CK_Bookings_Different CHECK(ExpertUserId <> LearnerUserId),
 CONSTRAINT CK_Bookings_Time CHECK(ScheduledEndAt > ScheduledStartAt),
 CONSTRAINT CK_Bookings_Price CHECK(AgreedPrice >= 0),
 CONSTRAINT CK_Bookings_Status CHECK(Status IN ('PendingPayment','Confirmed','InProgress','Completed','Cancelled','NoShow'))
);
CREATE INDEX IX_Bookings_ExpertTime ON dbo.ExpertBookings(ExpertUserId,ScheduledStartAt) INCLUDE(ScheduledEndAt,Status);
CREATE INDEX IX_Bookings_Learner ON dbo.ExpertBookings(LearnerUserId,CreatedAt DESC);
CREATE TABLE dbo.Payments (
 PaymentId BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Payments PRIMARY KEY,
 SubscriptionId INT NULL, ExpertBookingId INT NULL,
 Amount DECIMAL(10,2) NOT NULL, Currency CHAR(3) NOT NULL,
 Status VARCHAR(20) NOT NULL CONSTRAINT DF_Payments_Status DEFAULT('Pending'),
 Provider VARCHAR(50) NULL, ProviderReference NVARCHAR(255) NULL,
 PaidAt DATETIME2(3) NULL,
 CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Payments_Created DEFAULT SYSUTCDATETIME(),
 CONSTRAINT FK_Payments_Subscription FOREIGN KEY(SubscriptionId) REFERENCES dbo.UserSubscriptions(SubscriptionId),
 CONSTRAINT FK_Payments_Booking FOREIGN KEY(ExpertBookingId) REFERENCES dbo.ExpertBookings(ExpertBookingId),
 CONSTRAINT CK_Payments_Parent CHECK ((SubscriptionId IS NOT NULL AND ExpertBookingId IS NULL) OR (SubscriptionId IS NULL AND ExpertBookingId IS NOT NULL)),
 CONSTRAINT CK_Payments_Amount CHECK(Amount >= 0),
 CONSTRAINT CK_Payments_Status CHECK(Status IN ('Pending','Succeeded','Failed','Refunded','Cancelled')),
 CONSTRAINT CK_Payments_PaidAt CHECK(Status NOT IN ('Succeeded','Refunded') OR PaidAt IS NOT NULL),
 CONSTRAINT CK_Payments_ProviderRef CHECK(ProviderReference IS NULL OR Provider IS NOT NULL)
);
CREATE INDEX IX_Payments_Subscription ON dbo.Payments(SubscriptionId) WHERE SubscriptionId IS NOT NULL;
CREATE INDEX IX_Payments_Booking ON dbo.Payments(ExpertBookingId) WHERE ExpertBookingId IS NOT NULL;
CREATE UNIQUE INDEX UX_Payments_ProviderRef ON dbo.Payments(Provider,ProviderReference) WHERE Provider IS NOT NULL AND ProviderReference IS NOT NULL;
-- MODULE 03 swap, conversations, messaging, meetings
CREATE TABLE dbo.SwapRequests (
 SwapRequestId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_SwapRequests PRIMARY KEY,
 SenderUserId NVARCHAR(450) NOT NULL, ReceiverUserId NVARCHAR(450) NOT NULL,
 OfferedUserSkillId INT NOT NULL, OfferedIntent VARCHAR(10) NOT NULL CONSTRAINT DF_Swaps_OfferedIntent DEFAULT('Teach'),
 RequestedUserSkillId INT NOT NULL, RequestedIntent VARCHAR(10) NOT NULL CONSTRAINT DF_Swaps_RequestedIntent DEFAULT('Teach'),
 Status VARCHAR(20) NOT NULL CONSTRAINT DF_Swaps_Status DEFAULT('Pending'),
 Message NVARCHAR(2000) NULL, PreferredAt DATETIME2(3) NULL,
 CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Swaps_Created DEFAULT SYSUTCDATETIME(),
 UpdatedAt DATETIME2(3) NULL, RespondedAt DATETIME2(3) NULL,
 CONSTRAINT FK_Swaps_Sender FOREIGN KEY(SenderUserId) REFERENCES dbo.AspNetUsers(Id),
 CONSTRAINT FK_Swaps_Receiver FOREIGN KEY(ReceiverUserId) REFERENCES dbo.AspNetUsers(Id),
 CONSTRAINT FK_Swaps_OfferedOwnership FOREIGN KEY(OfferedUserSkillId,SenderUserId,OfferedIntent) REFERENCES dbo.UserSkills(UserSkillId,UserId,Intent),
 CONSTRAINT FK_Swaps_RequestedOwnership FOREIGN KEY(RequestedUserSkillId,ReceiverUserId,RequestedIntent) REFERENCES dbo.UserSkills(UserSkillId,UserId,Intent),
 CONSTRAINT CK_Swaps_DifferentUsers CHECK(SenderUserId <> ReceiverUserId),
 CONSTRAINT CK_Swaps_OfferedTeach CHECK(OfferedIntent = 'Teach'),
 CONSTRAINT CK_Swaps_RequestedTeach CHECK(RequestedIntent = 'Teach'),
 CONSTRAINT CK_Swaps_Status CHECK(Status IN ('Pending','Accepted','Rejected','Cancelled','InProgress','Completed'))
);
CREATE INDEX IX_Swaps_SenderStatus ON dbo.SwapRequests(SenderUserId,Status,CreatedAt DESC);
CREATE INDEX IX_Swaps_ReceiverStatus ON dbo.SwapRequests(ReceiverUserId,Status,CreatedAt DESC);
CREATE INDEX IX_Swaps_Offered ON dbo.SwapRequests(OfferedUserSkillId);
CREATE INDEX IX_Swaps_Requested ON dbo.SwapRequests(RequestedUserSkillId);
CREATE TABLE dbo.SwapRequestEvents (
 EventId BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_SwapRequestEvents PRIMARY KEY,
 SwapRequestId INT NOT NULL, ActorUserId NVARCHAR(450) NULL,
 OldStatus VARCHAR(20) NULL, NewStatus VARCHAR(20) NOT NULL,
 CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_SwapEvents_Created DEFAULT SYSUTCDATETIME(),
 CONSTRAINT FK_SwapEvents_Swap FOREIGN KEY(SwapRequestId) REFERENCES dbo.SwapRequests(SwapRequestId),
 CONSTRAINT FK_SwapEvents_Actor FOREIGN KEY(ActorUserId) REFERENCES dbo.AspNetUsers(Id),
 CONSTRAINT CK_SwapEvents_Old CHECK(OldStatus IS NULL OR OldStatus IN ('Pending','Accepted','Rejected','Cancelled','InProgress','Completed')),
 CONSTRAINT CK_SwapEvents_New CHECK(NewStatus IN ('Pending','Accepted','Rejected','Cancelled','InProgress','Completed'))
);
CREATE INDEX IX_SwapEvents_SwapTime ON dbo.SwapRequestEvents(SwapRequestId,CreatedAt);
CREATE TABLE dbo.Conversations (
 ConversationId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Conversations PRIMARY KEY,
 SwapRequestId INT NULL, ExpertBookingId INT NULL,
 CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Conversations_Created DEFAULT SYSUTCDATETIME(),
 CONSTRAINT FK_Conversations_Swap FOREIGN KEY(SwapRequestId) REFERENCES dbo.SwapRequests(SwapRequestId),
 CONSTRAINT FK_Conversations_Booking FOREIGN KEY(ExpertBookingId) REFERENCES dbo.ExpertBookings(ExpertBookingId),
 CONSTRAINT CK_Conversations_Parent CHECK ((SwapRequestId IS NOT NULL AND ExpertBookingId IS NULL) OR (SwapRequestId IS NULL AND ExpertBookingId IS NOT NULL))
);
CREATE UNIQUE INDEX UX_Conversations_Swap ON dbo.Conversations(SwapRequestId) WHERE SwapRequestId IS NOT NULL;
CREATE UNIQUE INDEX UX_Conversations_Booking ON dbo.Conversations(ExpertBookingId) WHERE ExpertBookingId IS NOT NULL;
CREATE TABLE dbo.ConversationMembers (
 ConversationId INT NOT NULL, UserId NVARCHAR(450) NOT NULL,
 JoinedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Members_Joined DEFAULT SYSUTCDATETIME(),
 LastReadAt DATETIME2(3) NULL,
 CONSTRAINT PK_ConversationMembers PRIMARY KEY(ConversationId,UserId),
 CONSTRAINT FK_Members_Conversation FOREIGN KEY(ConversationId) REFERENCES dbo.Conversations(ConversationId),
 CONSTRAINT FK_Members_User FOREIGN KEY(UserId) REFERENCES dbo.AspNetUsers(Id)
);
CREATE INDEX IX_Members_User ON dbo.ConversationMembers(UserId);
CREATE TABLE dbo.Messages (
 MessageId BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Messages PRIMARY KEY,
 ConversationId INT NOT NULL, SenderUserId NVARCHAR(450) NOT NULL,
 Body NVARCHAR(4000) NULL,
 SentAt DATETIME2(3) NOT NULL CONSTRAINT DF_Messages_Sent DEFAULT SYSUTCDATETIME(),
 DeletedAt DATETIME2(3) NULL,
 CONSTRAINT FK_Messages_Member FOREIGN KEY(ConversationId,SenderUserId) REFERENCES dbo.ConversationMembers(ConversationId,UserId),
 CONSTRAINT CK_Messages_Body CHECK(Body IS NULL OR LEN(LTRIM(RTRIM(Body))) > 0)
);
CREATE INDEX IX_Messages_ConversationTime ON dbo.Messages(ConversationId,SentAt,MessageId);
CREATE TABLE dbo.MessageAttachments (
 AttachmentId BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_MessageAttachments PRIMARY KEY,
 MessageId BIGINT NOT NULL, FileName NVARCHAR(255) NOT NULL,
 StorageKey NVARCHAR(1024) NOT NULL, ContentType NVARCHAR(150) NOT NULL,
 FileSizeBytes BIGINT NOT NULL,
 UploadedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Attachments_Uploaded DEFAULT SYSUTCDATETIME(),
 CONSTRAINT FK_Attachments_Message FOREIGN KEY(MessageId) REFERENCES dbo.Messages(MessageId),
 CONSTRAINT CK_Attachments_Size CHECK(FileSizeBytes > 0)
);
CREATE INDEX IX_Attachments_Message ON dbo.MessageAttachments(MessageId);
CREATE TABLE dbo.Meetings (
 MeetingId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Meetings PRIMARY KEY,
 SwapRequestId INT NULL, ExpertBookingId INT NULL,
 StartAt DATETIME2(3) NOT NULL, EndAt DATETIME2(3) NOT NULL,
 Status VARCHAR(20) NOT NULL CONSTRAINT DF_Meetings_Status DEFAULT('Scheduled'),
 Provider VARCHAR(30) NULL, ExternalMeetingId NVARCHAR(255) NULL, JoinUrl NVARCHAR(2048) NULL,
 CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Meetings_Created DEFAULT SYSUTCDATETIME(),
 CONSTRAINT FK_Meetings_Swap FOREIGN KEY(SwapRequestId) REFERENCES dbo.SwapRequests(SwapRequestId),
 CONSTRAINT FK_Meetings_Booking FOREIGN KEY(ExpertBookingId) REFERENCES dbo.ExpertBookings(ExpertBookingId),
 CONSTRAINT CK_Meetings_Parent CHECK ((SwapRequestId IS NOT NULL AND ExpertBookingId IS NULL) OR (SwapRequestId IS NULL AND ExpertBookingId IS NOT NULL)),
 CONSTRAINT CK_Meetings_Time CHECK(EndAt > StartAt),
 CONSTRAINT CK_Meetings_Status CHECK(Status IN ('Scheduled','InProgress','Completed','Cancelled','NoShow'))
);
CREATE INDEX IX_Meetings_SwapTime ON dbo.Meetings(SwapRequestId,StartAt) WHERE SwapRequestId IS NOT NULL;
CREATE INDEX IX_Meetings_BookingTime ON dbo.Meetings(ExpertBookingId,StartAt) WHERE ExpertBookingId IS NOT NULL;
-- MODULE 06 reviews & notifications
CREATE TABLE dbo.Reviews (
 ReviewId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Reviews PRIMARY KEY,
 ReviewerUserId NVARCHAR(450) NOT NULL, ReviewedUserId NVARCHAR(450) NOT NULL,
 SwapRequestId INT NULL, ExpertBookingId INT NULL,
 Rating TINYINT NOT NULL, Comment NVARCHAR(2000) NULL,
 CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Reviews_Created DEFAULT SYSUTCDATETIME(), UpdatedAt DATETIME2(3) NULL,
 CONSTRAINT FK_Reviews_Reviewer FOREIGN KEY(ReviewerUserId) REFERENCES dbo.AspNetUsers(Id),
 CONSTRAINT FK_Reviews_Reviewed FOREIGN KEY(ReviewedUserId) REFERENCES dbo.AspNetUsers(Id),
 CONSTRAINT FK_Reviews_Swap FOREIGN KEY(SwapRequestId) REFERENCES dbo.SwapRequests(SwapRequestId),
 CONSTRAINT FK_Reviews_Booking FOREIGN KEY(ExpertBookingId) REFERENCES dbo.ExpertBookings(ExpertBookingId),
 CONSTRAINT CK_Reviews_Rating CHECK(Rating BETWEEN 1 AND 5),
 CONSTRAINT CK_Reviews_NotSelf CHECK(ReviewerUserId <> ReviewedUserId),
 CONSTRAINT CK_Reviews_Parent CHECK ((SwapRequestId IS NOT NULL AND ExpertBookingId IS NULL) OR (SwapRequestId IS NULL AND ExpertBookingId IS NOT NULL))
);
CREATE UNIQUE INDEX UX_Reviews_SwapReviewer ON dbo.Reviews(SwapRequestId,ReviewerUserId) WHERE SwapRequestId IS NOT NULL;
CREATE UNIQUE INDEX UX_Reviews_BookingReviewer ON dbo.Reviews(ExpertBookingId,ReviewerUserId) WHERE ExpertBookingId IS NOT NULL;
CREATE INDEX IX_Reviews_Reviewed ON dbo.Reviews(ReviewedUserId,CreatedAt DESC);
CREATE TABLE dbo.Notifications (
 NotificationId BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Notifications PRIMARY KEY,
 UserId NVARCHAR(450) NOT NULL, Type VARCHAR(40) NOT NULL,
 Title NVARCHAR(200) NOT NULL, Body NVARCHAR(1000) NOT NULL,
 TargetUrl NVARCHAR(1000) NULL,
 CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Notifications_Created DEFAULT SYSUTCDATETIME(), ReadAt DATETIME2(3) NULL,
 CONSTRAINT FK_Notifications_User FOREIGN KEY(UserId) REFERENCES dbo.AspNetUsers(Id),
 CONSTRAINT CK_Notifications_Type CHECK(Type IN ('SwapRequest','Message','Meeting','Subscription','ExpertBooking','CareerProgress','Course','Review','System'))
);
CREATE INDEX IX_Notifications_UserTime ON dbo.Notifications(UserId,CreatedAt DESC);
CREATE INDEX IX_Notifications_Unread ON dbo.Notifications(UserId,CreatedAt DESC) WHERE ReadAt IS NULL;
CREATE TABLE dbo.NotificationPreferences (
 UserId NVARCHAR(450) NOT NULL CONSTRAINT PK_NotificationPreferences PRIMARY KEY,
 InAppEnabled BIT NOT NULL CONSTRAINT DF_NotifPrefs_InApp DEFAULT(1),
 EmailEnabled BIT NOT NULL CONSTRAINT DF_NotifPrefs_Email DEFAULT(1),
 SwapRequestsEnabled BIT NOT NULL CONSTRAINT DF_NotifPrefs_Swaps DEFAULT(1),
 MessagesEnabled BIT NOT NULL CONSTRAINT DF_NotifPrefs_Messages DEFAULT(1),
 MeetingsEnabled BIT NOT NULL CONSTRAINT DF_NotifPrefs_Meetings DEFAULT(1),
 PromotionsEnabled BIT NOT NULL CONSTRAINT DF_NotifPrefs_Promos DEFAULT(0),
 UpdatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_NotifPrefs_Updated DEFAULT SYSUTCDATETIME(),
 CONSTRAINT FK_NotifPrefs_User FOREIGN KEY(UserId) REFERENCES dbo.AspNetUsers(Id)
);
-- MODULE 07 admin settings/audit
CREATE TABLE dbo.SystemSettings (
 SettingKey VARCHAR(120) NOT NULL CONSTRAINT PK_SystemSettings PRIMARY KEY,
 SettingValue NVARCHAR(MAX) NULL, SettingGroup VARCHAR(50) NOT NULL,
 UpdatedByUserId NVARCHAR(450) NULL,
 UpdatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Settings_Updated DEFAULT SYSUTCDATETIME(),
 CONSTRAINT FK_Settings_UpdatedBy FOREIGN KEY(UpdatedByUserId) REFERENCES dbo.AspNetUsers(Id)
);
CREATE INDEX IX_Settings_Group ON dbo.SystemSettings(SettingGroup);
CREATE TABLE dbo.AuditLogs (
 AuditId BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_AuditLogs PRIMARY KEY,
 ActorUserId NVARCHAR(450) NULL, Action NVARCHAR(120) NOT NULL,
 EntityType NVARCHAR(100) NOT NULL, EntityId NVARCHAR(450) NULL,
 Summary NVARCHAR(1000) NULL,
 CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_AuditLogs_Created DEFAULT SYSUTCDATETIME(),
 CONSTRAINT FK_AuditLogs_Actor FOREIGN KEY(ActorUserId) REFERENCES dbo.AspNetUsers(Id)
);
CREATE INDEX IX_AuditLogs_Entity ON dbo.AuditLogs(EntityType,EntityId,CreatedAt DESC);
CREATE INDEX IX_AuditLogs_Actor ON dbo.AuditLogs(ActorUserId,CreatedAt DESC);
-- MODULE 08 AI history
CREATE TABLE dbo.AIConversations (
 AIConversationId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_AIConversations PRIMARY KEY,
 UserId NVARCHAR(450) NOT NULL, Title NVARCHAR(200) NOT NULL,
 CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_AIConversations_Created DEFAULT SYSUTCDATETIME(),
 UpdatedAt DATETIME2(3) NULL, DeletedAt DATETIME2(3) NULL,
 CONSTRAINT FK_AIConversations_User FOREIGN KEY(UserId) REFERENCES dbo.AspNetUsers(Id)
);
CREATE INDEX IX_AIConversations_User ON dbo.AIConversations(UserId,CreatedAt DESC);
CREATE TABLE dbo.AIMessages (
 AIMessageId BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_AIMessages PRIMARY KEY,
 AIConversationId INT NOT NULL, Role VARCHAR(20) NOT NULL,
 Content NVARCHAR(MAX) NOT NULL,
 CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_AIMessages_Created DEFAULT SYSUTCDATETIME(),
 CONSTRAINT FK_AIMessages_Conversation FOREIGN KEY(AIConversationId) REFERENCES dbo.AIConversations(AIConversationId),
 CONSTRAINT CK_AIMessages_Role CHECK(Role IN ('User','Assistant','System')),
 CONSTRAINT CK_AIMessages_Content CHECK(LEN(Content) > 0)
);
CREATE INDEX IX_AIMessages_Conversation ON dbo.AIMessages(AIConversationId,AIMessageId);
COMMIT TRANSACTION;
PRINT N'SkillsSwapDB schema created successfully: 46 tables.';

GO


-- ===== 02: VIEWS, PROCEDURES, TRIGGER =====
/* Run AFTER 01_SkillsSwapDB_Schema.sql. No GO required. */
USE [SkillsSwapDB];
SET NOCOUNT ON;
-- SQL Server requires CREATE VIEW/PROCEDURE/TRIGGER as the first statement in a batch;
-- EXEC(N'...') provides that batch without using GO.
EXEC(N'
CREATE OR ALTER VIEW dbo.vw_SkillDirectory AS
SELECT s.SkillId, s.Name AS SkillName, s.Slug AS SkillSlug, s.Level, s.AccessTier,
       sc.SubCategoryId, sc.Name AS SubCategoryName, c.CategoryId, c.Name AS CategoryName
FROM dbo.Skills AS s
JOIN dbo.SubCategories AS sc ON sc.SubCategoryId = s.SubCategoryId
JOIN dbo.Categories AS c ON c.CategoryId = sc.CategoryId
WHERE s.IsActive = 1 AND sc.IsActive = 1 AND c.IsActive = 1;
');
EXEC(N'
CREATE OR ALTER VIEW dbo.vw_UserSkillDirectory AS
SELECT us.UserSkillId, us.UserId, up.FullName, us.SkillId, s.Name AS SkillName,
       us.Intent, us.ProficiencyLevel, us.ExperienceMonths
FROM dbo.UserSkills AS us
JOIN dbo.Skills AS s ON s.SkillId = us.SkillId
LEFT JOIN dbo.UserProfiles AS up ON up.UserId = us.UserId;
');
EXEC(N'
CREATE OR ALTER VIEW dbo.vw_ExpertRatings AS
SELECT ep.UserId AS ExpertUserId, up.FullName, ep.Headline, ep.VerificationStatus,
       COUNT(r.ReviewId) AS ReviewCount,
       CAST(AVG(CAST(r.Rating AS DECIMAL(10,2))) AS DECIMAL(4,2)) AS AverageRating
FROM dbo.ExpertProfiles AS ep
LEFT JOIN dbo.UserProfiles AS up ON up.UserId = ep.UserId
LEFT JOIN dbo.Reviews AS r ON r.ReviewedUserId = ep.UserId AND r.ExpertBookingId IS NOT NULL
GROUP BY ep.UserId, up.FullName, ep.Headline, ep.VerificationStatus;
');
EXEC(N'
CREATE OR ALTER VIEW dbo.vw_CourseProgress AS
SELECT e.EnrollmentId, e.UserId, e.CourseId, c.Title AS CourseTitle, e.Status,
       COUNT(l.LessonId) AS PublishedLessonCount,
       COUNT(CASE WHEN lp.Status = ''Completed'' THEN 1 END) AS CompletedLessonCount,
       CAST(CASE WHEN COUNT(l.LessonId) = 0 THEN 0
                 ELSE 100.0 * COUNT(CASE WHEN lp.Status = ''Completed'' THEN 1 END) / COUNT(l.LessonId)
            END AS DECIMAL(5,2)) AS ProgressPercent
FROM dbo.CourseEnrollments AS e
JOIN dbo.Courses AS c ON c.CourseId = e.CourseId
LEFT JOIN dbo.CourseLessons AS l ON l.CourseId = e.CourseId AND l.IsPublished = 1
LEFT JOIN dbo.UserLessonProgress AS lp ON lp.EnrollmentId = e.EnrollmentId AND lp.LessonId = l.LessonId
GROUP BY e.EnrollmentId, e.UserId, e.CourseId, c.Title, e.Status;
');
EXEC(N'
CREATE OR ALTER VIEW dbo.vw_SubscriptionOverview AS
SELECT s.SubscriptionId, s.UserId, p.Code AS PlanCode, p.Name AS PlanName,
       s.Status, s.StartAt, s.EndAt, s.TrialEndsAt,
       (SELECT COUNT_BIG(*) FROM dbo.Payments AS pay
        WHERE pay.SubscriptionId = s.SubscriptionId AND pay.Status = ''Succeeded'') AS SuccessfulPaymentCount
FROM dbo.UserSubscriptions AS s
JOIN dbo.SubscriptionPlans AS p ON p.PlanId = s.PlanId;
');
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.sp_SearchSkills
    @Search NVARCHAR(120) = NULL,
    @CategoryId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM dbo.vw_SkillDirectory
    WHERE (@Search IS NULL OR SkillName LIKE N''%'' + @Search + N''%'')
      AND (@CategoryId IS NULL OR CategoryId = @CategoryId)
    ORDER BY CategoryName, SubCategoryName, SkillName;
END;
');
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.sp_GetUserSwapRequests
    @UserId NVARCHAR(450)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT sr.SwapRequestId, sr.SenderUserId, sr.ReceiverUserId,
           sr.OfferedUserSkillId, sr.RequestedUserSkillId,
           sr.Status, sr.Message, sr.CreatedAt, sr.RespondedAt
    FROM dbo.SwapRequests AS sr
    WHERE sr.SenderUserId = @UserId OR sr.ReceiverUserId = @UserId
    ORDER BY sr.CreatedAt DESC, sr.SwapRequestId DESC;
END;
');
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.sp_GetUserCourseProgress
    @UserId NVARCHAR(450)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM dbo.vw_CourseProgress
    WHERE UserId = @UserId
    ORDER BY CourseTitle;
END;
');
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.sp_GetDashboardCounts
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
      (SELECT COUNT_BIG(*) FROM dbo.AspNetUsers) AS TotalUsers,
      (SELECT COUNT_BIG(*) FROM dbo.Skills WHERE IsActive = 1) AS ActiveSkills,
      (SELECT COUNT_BIG(*) FROM dbo.Courses WHERE Status = ''Published'') AS PublishedCourses,
      (SELECT COUNT_BIG(*) FROM dbo.SwapRequests) AS TotalSwapRequests,
      (SELECT COUNT_BIG(*) FROM dbo.ExpertBookings) AS TotalExpertBookings,
      (SELECT COUNT_BIG(*) FROM dbo.UserSubscriptions WHERE Status IN (''Active'',''Trialing'')) AS CurrentSubscriptions;
END;
');
-- Multi-row-safe status history. ActorUserId intentionally NULL (database cannot authenticate the application actor).
EXEC(N'
CREATE OR ALTER TRIGGER dbo.trg_SwapRequestStatusHistory
ON dbo.SwapRequests
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.SwapRequestEvents (SwapRequestId, ActorUserId, OldStatus, NewStatus)
    SELECT i.SwapRequestId, NULL, d.Status, i.Status
    FROM inserted AS i
    LEFT JOIN deleted AS d ON d.SwapRequestId = i.SwapRequestId
    WHERE d.SwapRequestId IS NULL OR d.Status <> i.Status;
END;
');
PRINT N'Views (5), stored procedures (4), trigger (1) created.';

GO


-- ===== 05: 05_SkillsSwapDB_SeedData =====
-- Skills Swap | Reference seed matched to uploaded HTML UI (Nov 2026)
-- Run AFTER 01_SkillsSwapDB_Schema.sql. Does not create users, courses or fake payments.
-- Re-runnable for existing records; never overwrites administrator edits.
USE [SkillsSwapDB];
SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRY
 BEGIN TRANSACTION;
 -- Categories
 IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Slug='education') INSERT dbo.Categories(Name,Slug,Description,Icon,DisplayOrder) VALUES(N'Education','education',N'Learn academic and teaching skills',N'🎓',1);
 IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Slug='technology') INSERT dbo.Categories(Name,Slug,Description,Icon,DisplayOrder) VALUES(N'Technology','technology',N'Programming, design, and IT',N'💻',2);
 IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Slug='handmade') INSERT dbo.Categories(Name,Slug,Description,Icon,DisplayOrder) VALUES(N'Handmade','handmade',N'Crafts, arts, and DIY projects',N'🎨',3);
 IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Slug='entertainment') INSERT dbo.Categories(Name,Slug,Description,Icon,DisplayOrder) VALUES(N'Entertainment','entertainment',N'Music, video, and performance',N'🎬',4);
 IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Slug='business') INSERT dbo.Categories(Name,Slug,Description,Icon,DisplayOrder) VALUES(N'Business','business',N'Marketing, management, and sales',N'💼',5);
 IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Slug='health-fitness') INSERT dbo.Categories(Name,Slug,Description,Icon,DisplayOrder) VALUES(N'Health & Fitness','health-fitness',N'Sports, nutrition, and wellness',N'❤️',6);
 -- Subcategories: logical grouping to satisfy the existing required FK.
 -- These names are organizational suggestions, not all literal labels from the UI.
 IF NOT EXISTS (SELECT 1 FROM dbo.SubCategories WHERE Slug='web-development' AND CategoryId=(SELECT CategoryId FROM dbo.Categories WHERE Slug='technology')) INSERT dbo.SubCategories(CategoryId,Name,Slug) SELECT CategoryId,N'Web Development','web-development' FROM dbo.Categories WHERE Slug='technology';
 IF NOT EXISTS (SELECT 1 FROM dbo.SubCategories WHERE Slug='programming' AND CategoryId=(SELECT CategoryId FROM dbo.Categories WHERE Slug='technology')) INSERT dbo.SubCategories(CategoryId,Name,Slug) SELECT CategoryId,N'Programming','programming' FROM dbo.Categories WHERE Slug='technology';
 IF NOT EXISTS (SELECT 1 FROM dbo.SubCategories WHERE Slug='design' AND CategoryId=(SELECT CategoryId FROM dbo.Categories WHERE Slug='technology')) INSERT dbo.SubCategories(CategoryId,Name,Slug) SELECT CategoryId,N'Design','design' FROM dbo.Categories WHERE Slug='technology';
 IF NOT EXISTS (SELECT 1 FROM dbo.SubCategories WHERE Slug='mobile-development' AND CategoryId=(SELECT CategoryId FROM dbo.Categories WHERE Slug='technology')) INSERT dbo.SubCategories(CategoryId,Name,Slug) SELECT CategoryId,N'Mobile Development','mobile-development' FROM dbo.Categories WHERE Slug='technology';
 IF NOT EXISTS (SELECT 1 FROM dbo.SubCategories WHERE Slug='devops' AND CategoryId=(SELECT CategoryId FROM dbo.Categories WHERE Slug='technology')) INSERT dbo.SubCategories(CategoryId,Name,Slug) SELECT CategoryId,N'DevOps','devops' FROM dbo.Categories WHERE Slug='technology';
 IF NOT EXISTS (SELECT 1 FROM dbo.SubCategories WHERE Slug='data-science' AND CategoryId=(SELECT CategoryId FROM dbo.Categories WHERE Slug='technology')) INSERT dbo.SubCategories(CategoryId,Name,Slug) SELECT CategoryId,N'Data Science','data-science' FROM dbo.Categories WHERE Slug='technology';
 IF NOT EXISTS (SELECT 1 FROM dbo.SubCategories WHERE Slug='graphic-design' AND CategoryId=(SELECT CategoryId FROM dbo.Categories WHERE Slug='handmade')) INSERT dbo.SubCategories(CategoryId,Name,Slug) SELECT CategoryId,N'Graphic Design','graphic-design' FROM dbo.Categories WHERE Slug='handmade';
 IF NOT EXISTS (SELECT 1 FROM dbo.SubCategories WHERE Slug='photography' AND CategoryId=(SELECT CategoryId FROM dbo.Categories WHERE Slug='handmade')) INSERT dbo.SubCategories(CategoryId,Name,Slug) SELECT CategoryId,N'Photography','photography' FROM dbo.Categories WHERE Slug='handmade';
 IF NOT EXISTS (SELECT 1 FROM dbo.SubCategories WHERE Slug='wellness' AND CategoryId=(SELECT CategoryId FROM dbo.Categories WHERE Slug='health-fitness')) INSERT dbo.SubCategories(CategoryId,Name,Slug) SELECT CategoryId,N'Wellness','wellness' FROM dbo.Categories WHERE Slug='health-fitness';
 IF NOT EXISTS (SELECT 1 FROM dbo.SubCategories WHERE Slug='teaching' AND CategoryId=(SELECT CategoryId FROM dbo.Categories WHERE Slug='education')) INSERT dbo.SubCategories(CategoryId,Name,Slug) SELECT CategoryId,N'Teaching','teaching' FROM dbo.Categories WHERE Slug='education';
 IF NOT EXISTS (SELECT 1 FROM dbo.SubCategories WHERE Slug='music' AND CategoryId=(SELECT CategoryId FROM dbo.Categories WHERE Slug='entertainment')) INSERT dbo.SubCategories(CategoryId,Name,Slug) SELECT CategoryId,N'Music','music' FROM dbo.Categories WHERE Slug='entertainment';
 IF NOT EXISTS (SELECT 1 FROM dbo.SubCategories WHERE Slug='marketing' AND CategoryId=(SELECT CategoryId FROM dbo.Categories WHERE Slug='business')) INSERT dbo.SubCategories(CategoryId,Name,Slug) SELECT CategoryId,N'Marketing','marketing' FROM dbo.Categories WHERE Slug='business';
 -- Skills: visible skill cards + course-associated skills
 IF NOT EXISTS (SELECT 1 FROM dbo.Skills WHERE Slug='web-development') INSERT dbo.Skills(SubCategoryId,Name,Slug,Description,Level,AccessTier) SELECT SubCategoryId,N'Web Development','web-development',N'Build websites and learn modern web fundamentals.','Beginner','Basic' FROM dbo.SubCategories WHERE Slug='web-development';
 IF NOT EXISTS (SELECT 1 FROM dbo.Skills WHERE Slug='ui-ux-design') INSERT dbo.Skills(SubCategoryId,Name,Slug,Description,Level,AccessTier) SELECT SubCategoryId,N'UI/UX Design','ui-ux-design',N'Learn user-centered interface and experience design.','Beginner','Basic' FROM dbo.SubCategories WHERE Slug='design';
 IF NOT EXISTS (SELECT 1 FROM dbo.Skills WHERE Slug='javascript') INSERT dbo.Skills(SubCategoryId,Name,Slug,Description,Level,AccessTier) SELECT SubCategoryId,N'JavaScript','javascript',N'Build interactive web applications.','Intermediate','Advanced' FROM dbo.SubCategories WHERE Slug='programming';
 IF NOT EXISTS (SELECT 1 FROM dbo.Skills WHERE Slug='react') INSERT dbo.Skills(SubCategoryId,Name,Slug,Description,Level,AccessTier) SELECT SubCategoryId,N'React','react',N'Create modern component-based interfaces.','Advanced','Advanced' FROM dbo.SubCategories WHERE Slug='web-development';
 IF NOT EXISTS (SELECT 1 FROM dbo.Skills WHERE Slug='git-github') INSERT dbo.Skills(SubCategoryId,Name,Slug,Description,Level,AccessTier) SELECT SubCategoryId,N'Git & GitHub','git-github',N'Learn version control and collaboration.','Beginner','Basic' FROM dbo.SubCategories WHERE Slug='web-development';
 IF NOT EXISTS (SELECT 1 FROM dbo.Skills WHERE Slug='mobile-app-development') INSERT dbo.Skills(SubCategoryId,Name,Slug,Description,Level,AccessTier) SELECT SubCategoryId,N'Mobile App Development','mobile-app-development',N'Build mobile applications for modern platforms.','Intermediate','Advanced' FROM dbo.SubCategories WHERE Slug='mobile-development';
 IF NOT EXISTS (SELECT 1 FROM dbo.Skills WHERE Slug='python-programming') INSERT dbo.Skills(SubCategoryId,Name,Slug,Description,Level,AccessTier) SELECT SubCategoryId,N'Python Programming','python-programming',N'Programming language.','Beginner','Basic' FROM dbo.SubCategories WHERE Slug='programming';
 IF NOT EXISTS (SELECT 1 FROM dbo.Skills WHERE Slug='graphic-design') INSERT dbo.Skills(SubCategoryId,Name,Slug,Description,Level,AccessTier) SELECT SubCategoryId,N'Graphic Design','graphic-design',N'Visual design skills.','Intermediate','Advanced' FROM dbo.SubCategories WHERE Slug='graphic-design';
 IF NOT EXISTS (SELECT 1 FROM dbo.Skills WHERE Slug='yoga-basics') INSERT dbo.Skills(SubCategoryId,Name,Slug,Description,Level,AccessTier) SELECT SubCategoryId,N'Yoga Basics','yoga-basics',N'Fitness and wellness.','Beginner','Basic' FROM dbo.SubCategories WHERE Slug='wellness';
 IF NOT EXISTS (SELECT 1 FROM dbo.Skills WHERE Slug='photography') INSERT dbo.Skills(SubCategoryId,Name,Slug,Description,Level,AccessTier) SELECT SubCategoryId,N'Photography','photography',N'Camera and composition.','Beginner','Basic' FROM dbo.SubCategories WHERE Slug='photography';
 IF NOT EXISTS (SELECT 1 FROM dbo.Skills WHERE Slug='advanced-javascript') INSERT dbo.Skills(SubCategoryId,Name,Slug,Description,Level,AccessTier) SELECT SubCategoryId,N'Advanced JavaScript','advanced-javascript',N'Advanced JavaScript techniques.','Advanced','Advanced' FROM dbo.SubCategories WHERE Slug='web-development';
 IF NOT EXISTS (SELECT 1 FROM dbo.Skills WHERE Slug='react-development') INSERT dbo.Skills(SubCategoryId,Name,Slug,Description,Level,AccessTier) SELECT SubCategoryId,N'React Development','react-development',N'React application development.','Advanced','Advanced' FROM dbo.SubCategories WHERE Slug='web-development';
 IF NOT EXISTS (SELECT 1 FROM dbo.Skills WHERE Slug='photography-basics') INSERT dbo.Skills(SubCategoryId,Name,Slug,Description,Level,AccessTier) SELECT SubCategoryId,N'Photography Basics','photography-basics',N'Photography fundamentals.','Beginner','Basic' FROM dbo.SubCategories WHERE Slug='photography';
 IF NOT EXISTS (SELECT 1 FROM dbo.Skills WHERE Slug='graphic-design-masterclass') INSERT dbo.Skills(SubCategoryId,Name,Slug,Description,Level,AccessTier) SELECT SubCategoryId,N'Graphic Design Masterclass','graphic-design-masterclass',N'Graphic design techniques.','Intermediate','Advanced' FROM dbo.SubCategories WHERE Slug='graphic-design';
 -- Exact learning outcomes shown on skill-details.html for Web Development
 IF NOT EXISTS (SELECT 1 FROM dbo.SkillLearningOutcomes o JOIN dbo.Skills s ON s.SkillId=o.SkillId WHERE s.Slug='web-development' AND o.DisplayOrder=1) INSERT dbo.SkillLearningOutcomes(SkillId,Description,DisplayOrder) SELECT SkillId,N'HTML Fundamentals',1 FROM dbo.Skills WHERE Slug='web-development';
 IF NOT EXISTS (SELECT 1 FROM dbo.SkillLearningOutcomes o JOIN dbo.Skills s ON s.SkillId=o.SkillId WHERE s.Slug='web-development' AND o.DisplayOrder=2) INSERT dbo.SkillLearningOutcomes(SkillId,Description,DisplayOrder) SELECT SkillId,N'CSS & Responsive Design',2 FROM dbo.Skills WHERE Slug='web-development';
 IF NOT EXISTS (SELECT 1 FROM dbo.SkillLearningOutcomes o JOIN dbo.Skills s ON s.SkillId=o.SkillId WHERE s.Slug='web-development' AND o.DisplayOrder=3) INSERT dbo.SkillLearningOutcomes(SkillId,Description,DisplayOrder) SELECT SkillId,N'JavaScript Basics',3 FROM dbo.Skills WHERE Slug='web-development';
 IF NOT EXISTS (SELECT 1 FROM dbo.SkillLearningOutcomes o JOIN dbo.Skills s ON s.SkillId=o.SkillId WHERE s.Slug='web-development' AND o.DisplayOrder=4) INSERT dbo.SkillLearningOutcomes(SkillId,Description,DisplayOrder) SELECT SkillId,N'Web Development Basics',4 FROM dbo.Skills WHERE Slug='web-development';
 -- Career paths: titles and descriptions from admin page; milestones are NOT invented.
 IF NOT EXISTS (SELECT 1 FROM dbo.CareerPaths WHERE Slug='full-stack-web-developer') INSERT dbo.CareerPaths(Title,Slug,Description,DifficultyLevel,IsPublished,DisplayOrder) VALUES(N'Full Stack Web Developer','full-stack-web-developer',N'Frontend + Backend + Database','Intermediate',1,1);
 IF NOT EXISTS (SELECT 1 FROM dbo.CareerPaths WHERE Slug='ui-ux-designer') INSERT dbo.CareerPaths(Title,Slug,Description,DifficultyLevel,IsPublished,DisplayOrder) VALUES(N'UI/UX Designer','ui-ux-designer',N'Design thinking + Figma + Prototyping','Beginner',1,2);
 IF NOT EXISTS (SELECT 1 FROM dbo.CareerPaths WHERE Slug='mobile-app-developer') INSERT dbo.CareerPaths(Title,Slug,Description,DifficultyLevel,IsPublished,DisplayOrder) VALUES(N'Mobile App Developer','mobile-app-developer',N'iOS + Android + Cross-platform','Intermediate',1,3);
 IF NOT EXISTS (SELECT 1 FROM dbo.CareerPaths WHERE Slug='data-scientist') INSERT dbo.CareerPaths(Title,Slug,Description,DifficultyLevel,IsPublished,DisplayOrder) VALUES(N'Data Scientist','data-scientist',N'Python + ML + Statistics','Advanced',1,4);
 IF NOT EXISTS (SELECT 1 FROM dbo.CareerPaths WHERE Slug='devops-engineer') INSERT dbo.CareerPaths(Title,Slug,Description,DifficultyLevel,IsPublished,DisplayOrder) VALUES(N'DevOps Engineer','devops-engineer',N'Docker + K8s + CI/CD','Advanced',0,5);
 IF NOT EXISTS (SELECT 1 FROM dbo.CareerPaths WHERE Slug='graphic-designer') INSERT dbo.CareerPaths(Title,Slug,Description,DifficultyLevel,IsPublished,DisplayOrder) VALUES(N'Graphic Designer','graphic-designer',N'Photoshop + Illustrator + Branding','Beginner',1,6);
 -- Pricing UI: USD $0/$9/$19 monthly; yearly at advertised 20% discount.
 -- Yearly amount = monthly * 12 * 0.8. Trial policy belongs in backend/subscription records.
 IF NOT EXISTS (SELECT 1 FROM dbo.SubscriptionPlans WHERE Code='FREE') INSERT dbo.SubscriptionPlans(Code,Name,Price,Currency,BillingPeriod,DisplayOrder) VALUES('FREE',N'Free',0.00,'USD','None',0);
 IF NOT EXISTS (SELECT 1 FROM dbo.SubscriptionPlans WHERE Code='PLUS_MONTHLY') INSERT dbo.SubscriptionPlans(Code,Name,Price,Currency,BillingPeriod,DisplayOrder) VALUES('PLUS_MONTHLY',N'Plus',9.00,'USD','Monthly',1);
 IF NOT EXISTS (SELECT 1 FROM dbo.SubscriptionPlans WHERE Code='PLUS_YEARLY') INSERT dbo.SubscriptionPlans(Code,Name,Price,Currency,BillingPeriod,DisplayOrder) VALUES('PLUS_YEARLY',N'Plus',86.40,'USD','Yearly',2);
 IF NOT EXISTS (SELECT 1 FROM dbo.SubscriptionPlans WHERE Code='PRO_MONTHLY') INSERT dbo.SubscriptionPlans(Code,Name,Price,Currency,BillingPeriod,DisplayOrder) VALUES('PRO_MONTHLY',N'Pro',19.00,'USD','Monthly',3);
 IF NOT EXISTS (SELECT 1 FROM dbo.SubscriptionPlans WHERE Code='PRO_YEARLY') INSERT dbo.SubscriptionPlans(Code,Name,Price,Currency,BillingPeriod,DisplayOrder) VALUES('PRO_YEARLY',N'Pro',182.40,'USD','Yearly',4);
 -- Features and per-plan access from pricing page
 IF NOT EXISTS (SELECT 1 FROM dbo.Features WHERE Code='BASIC_SKILLS') INSERT dbo.Features(Code,Name) VALUES('BASIC_SKILLS',N'Basic Skills');
 IF NOT EXISTS (SELECT 1 FROM dbo.Features WHERE Code='ADVANCED_SKILLS') INSERT dbo.Features(Code,Name) VALUES('ADVANCED_SKILLS',N'Advanced Skills');
 IF NOT EXISTS (SELECT 1 FROM dbo.Features WHERE Code='SWAP_REQUESTS') INSERT dbo.Features(Code,Name) VALUES('SWAP_REQUESTS',N'Unlimited Swap Requests');
 IF NOT EXISTS (SELECT 1 FROM dbo.Features WHERE Code='CHAT') INSERT dbo.Features(Code,Name) VALUES('CHAT',N'Chat with Partners');
 IF NOT EXISTS (SELECT 1 FROM dbo.Features WHERE Code='REVIEWS') INSERT dbo.Features(Code,Name) VALUES('REVIEWS',N'Reviews and Ratings');
 IF NOT EXISTS (SELECT 1 FROM dbo.Features WHERE Code='PRIORITY_MATCHING') INSERT dbo.Features(Code,Name) VALUES('PRIORITY_MATCHING',N'Priority Matching');
 IF NOT EXISTS (SELECT 1 FROM dbo.Features WHERE Code='CAREER_PATH') INSERT dbo.Features(Code,Name) VALUES('CAREER_PATH',N'Career Path Generator');
 IF NOT EXISTS (SELECT 1 FROM dbo.Features WHERE Code='ADVANCED_ANALYTICS') INSERT dbo.Features(Code,Name) VALUES('ADVANCED_ANALYTICS',N'Advanced Analytics');
 IF NOT EXISTS (SELECT 1 FROM dbo.Features WHERE Code='PRIORITY_SUPPORT') INSERT dbo.Features(Code,Name) VALUES('PRIORITY_SUPPORT',N'Priority Support');
 IF NOT EXISTS (SELECT 1 FROM dbo.Features WHERE Code='EXPERT_BOOKING') INSERT dbo.Features(Code,Name) VALUES('EXPERT_BOOKING',N'1-on-1 Mentorship');
 IF NOT EXISTS (SELECT 1 FROM dbo.Features WHERE Code='WEEKLY_REPORTS') INSERT dbo.Features(Code,Name) VALUES('WEEKLY_REPORTS',N'Weekly Progress Reports');
 IF NOT EXISTS (SELECT 1 FROM dbo.Features WHERE Code='CUSTOM_ROADMAP') INSERT dbo.Features(Code,Name) VALUES('CUSTOM_ROADMAP',N'Custom Career Roadmap');
 IF NOT EXISTS (SELECT 1 FROM dbo.Features WHERE Code='WORKSHOPS') INSERT dbo.Features(Code,Name) VALUES('WORKSHOPS',N'Exclusive Workshops');
 IF NOT EXISTS (SELECT 1 FROM dbo.Features WHERE Code='CERTIFICATE') INSERT dbo.Features(Code,Name) VALUES('CERTIFICATE',N'Certificate of Completion');
 IF NOT EXISTS (SELECT 1 FROM dbo.Features WHERE Code='API_ACCESS') INSERT dbo.Features(Code,Name) VALUES('API_ACCESS',N'API Access');
 IF NOT EXISTS (SELECT 1 FROM dbo.Features WHERE Code='SUPPORT_24_7') INSERT dbo.Features(Code,Name) VALUES('SUPPORT_24_7',N'24/7 Support');
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='FREE' AND f.Code='BASIC_SKILLS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='FREE' AND f.Code='BASIC_SKILLS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='FREE' AND f.Code='SWAP_REQUESTS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='FREE' AND f.Code='SWAP_REQUESTS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='FREE' AND f.Code='CHAT') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='FREE' AND f.Code='CHAT';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='FREE' AND f.Code='REVIEWS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='FREE' AND f.Code='REVIEWS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PLUS_MONTHLY' AND f.Code='BASIC_SKILLS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PLUS_MONTHLY' AND f.Code='BASIC_SKILLS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PLUS_MONTHLY' AND f.Code='ADVANCED_SKILLS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PLUS_MONTHLY' AND f.Code='ADVANCED_SKILLS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PLUS_MONTHLY' AND f.Code='SWAP_REQUESTS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PLUS_MONTHLY' AND f.Code='SWAP_REQUESTS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PLUS_MONTHLY' AND f.Code='CHAT') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PLUS_MONTHLY' AND f.Code='CHAT';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PLUS_MONTHLY' AND f.Code='REVIEWS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PLUS_MONTHLY' AND f.Code='REVIEWS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PLUS_MONTHLY' AND f.Code='PRIORITY_MATCHING') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PLUS_MONTHLY' AND f.Code='PRIORITY_MATCHING';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PLUS_MONTHLY' AND f.Code='CAREER_PATH') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PLUS_MONTHLY' AND f.Code='CAREER_PATH';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PLUS_MONTHLY' AND f.Code='ADVANCED_ANALYTICS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PLUS_MONTHLY' AND f.Code='ADVANCED_ANALYTICS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PLUS_MONTHLY' AND f.Code='PRIORITY_SUPPORT') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PLUS_MONTHLY' AND f.Code='PRIORITY_SUPPORT';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PLUS_YEARLY' AND f.Code='BASIC_SKILLS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PLUS_YEARLY' AND f.Code='BASIC_SKILLS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PLUS_YEARLY' AND f.Code='ADVANCED_SKILLS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PLUS_YEARLY' AND f.Code='ADVANCED_SKILLS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PLUS_YEARLY' AND f.Code='SWAP_REQUESTS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PLUS_YEARLY' AND f.Code='SWAP_REQUESTS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PLUS_YEARLY' AND f.Code='CHAT') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PLUS_YEARLY' AND f.Code='CHAT';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PLUS_YEARLY' AND f.Code='REVIEWS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PLUS_YEARLY' AND f.Code='REVIEWS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PLUS_YEARLY' AND f.Code='PRIORITY_MATCHING') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PLUS_YEARLY' AND f.Code='PRIORITY_MATCHING';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PLUS_YEARLY' AND f.Code='CAREER_PATH') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PLUS_YEARLY' AND f.Code='CAREER_PATH';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PLUS_YEARLY' AND f.Code='ADVANCED_ANALYTICS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PLUS_YEARLY' AND f.Code='ADVANCED_ANALYTICS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PLUS_YEARLY' AND f.Code='PRIORITY_SUPPORT') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PLUS_YEARLY' AND f.Code='PRIORITY_SUPPORT';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_MONTHLY' AND f.Code='BASIC_SKILLS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_MONTHLY' AND f.Code='BASIC_SKILLS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_MONTHLY' AND f.Code='ADVANCED_SKILLS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_MONTHLY' AND f.Code='ADVANCED_SKILLS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_MONTHLY' AND f.Code='SWAP_REQUESTS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_MONTHLY' AND f.Code='SWAP_REQUESTS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_MONTHLY' AND f.Code='CHAT') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_MONTHLY' AND f.Code='CHAT';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_MONTHLY' AND f.Code='REVIEWS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_MONTHLY' AND f.Code='REVIEWS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_MONTHLY' AND f.Code='PRIORITY_MATCHING') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_MONTHLY' AND f.Code='PRIORITY_MATCHING';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_MONTHLY' AND f.Code='CAREER_PATH') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_MONTHLY' AND f.Code='CAREER_PATH';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_MONTHLY' AND f.Code='ADVANCED_ANALYTICS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_MONTHLY' AND f.Code='ADVANCED_ANALYTICS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_MONTHLY' AND f.Code='PRIORITY_SUPPORT') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_MONTHLY' AND f.Code='PRIORITY_SUPPORT';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_MONTHLY' AND f.Code='EXPERT_BOOKING') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_MONTHLY' AND f.Code='EXPERT_BOOKING';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_MONTHLY' AND f.Code='WEEKLY_REPORTS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_MONTHLY' AND f.Code='WEEKLY_REPORTS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_MONTHLY' AND f.Code='CUSTOM_ROADMAP') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_MONTHLY' AND f.Code='CUSTOM_ROADMAP';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_MONTHLY' AND f.Code='WORKSHOPS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_MONTHLY' AND f.Code='WORKSHOPS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_MONTHLY' AND f.Code='CERTIFICATE') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_MONTHLY' AND f.Code='CERTIFICATE';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_MONTHLY' AND f.Code='API_ACCESS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_MONTHLY' AND f.Code='API_ACCESS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_MONTHLY' AND f.Code='SUPPORT_24_7') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_MONTHLY' AND f.Code='SUPPORT_24_7';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_YEARLY' AND f.Code='BASIC_SKILLS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_YEARLY' AND f.Code='BASIC_SKILLS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_YEARLY' AND f.Code='ADVANCED_SKILLS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_YEARLY' AND f.Code='ADVANCED_SKILLS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_YEARLY' AND f.Code='SWAP_REQUESTS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_YEARLY' AND f.Code='SWAP_REQUESTS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_YEARLY' AND f.Code='CHAT') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_YEARLY' AND f.Code='CHAT';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_YEARLY' AND f.Code='REVIEWS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_YEARLY' AND f.Code='REVIEWS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_YEARLY' AND f.Code='PRIORITY_MATCHING') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_YEARLY' AND f.Code='PRIORITY_MATCHING';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_YEARLY' AND f.Code='CAREER_PATH') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_YEARLY' AND f.Code='CAREER_PATH';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_YEARLY' AND f.Code='ADVANCED_ANALYTICS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_YEARLY' AND f.Code='ADVANCED_ANALYTICS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_YEARLY' AND f.Code='PRIORITY_SUPPORT') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_YEARLY' AND f.Code='PRIORITY_SUPPORT';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_YEARLY' AND f.Code='EXPERT_BOOKING') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_YEARLY' AND f.Code='EXPERT_BOOKING';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_YEARLY' AND f.Code='WEEKLY_REPORTS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_YEARLY' AND f.Code='WEEKLY_REPORTS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_YEARLY' AND f.Code='CUSTOM_ROADMAP') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_YEARLY' AND f.Code='CUSTOM_ROADMAP';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_YEARLY' AND f.Code='WORKSHOPS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_YEARLY' AND f.Code='WORKSHOPS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_YEARLY' AND f.Code='CERTIFICATE') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_YEARLY' AND f.Code='CERTIFICATE';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_YEARLY' AND f.Code='API_ACCESS') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_YEARLY' AND f.Code='API_ACCESS';
 IF NOT EXISTS (SELECT 1 FROM dbo.PlanFeatures pf JOIN dbo.SubscriptionPlans p ON p.PlanId=pf.PlanId JOIN dbo.Features f ON f.FeatureId=pf.FeatureId WHERE p.Code='PRO_YEARLY' AND f.Code='SUPPORT_24_7') INSERT dbo.PlanFeatures(PlanId,FeatureId,IsEnabled,UsageLimit) SELECT p.PlanId,f.FeatureId,1,NULL FROM dbo.SubscriptionPlans p CROSS JOIN dbo.Features f WHERE p.Code='PRO_YEARLY' AND f.Code='SUPPORT_24_7';
 COMMIT TRANSACTION;
 PRINT N'SkillsSwapDB reference seed completed successfully.';
END TRY
BEGIN CATCH
 IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
 THROW;
END CATCH;
SELECT N'Categories' AS Entity,COUNT(*) AS Total FROM dbo.Categories
UNION ALL SELECT N'SubCategories',COUNT(*) FROM dbo.SubCategories
UNION ALL SELECT N'Skills',COUNT(*) FROM dbo.Skills
UNION ALL SELECT N'CareerPaths',COUNT(*) FROM dbo.CareerPaths
UNION ALL SELECT N'SubscriptionPlans',COUNT(*) FROM dbo.SubscriptionPlans
UNION ALL SELECT N'Features',COUNT(*) FROM dbo.Features
UNION ALL SELECT N'PlanFeatures',COUNT(*) FROM dbo.PlanFeatures;

GO


-- ===== 06: 06_SkillsSwapDB_CareerMilestones =====
-- Skills Swap | Career milestones and skill mappings | run after 05 SeedData
-- Proposed educational milestones, not exact UI copy. Safe to re-run.
USE [SkillsSwapDB];
SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRY
 BEGIN TRANSACTION;
 IF NOT EXISTS (SELECT 1 FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId WHERE p.Slug='full-stack-web-developer' AND m.SequenceNo=1)
  INSERT dbo.CareerMilestones(CareerPathId,Title,Description,SequenceNo,EstimatedHours) SELECT CareerPathId,N'HTML, CSS & Web Foundations',N'Build responsive page layouts',1,18 FROM dbo.CareerPaths WHERE Slug='full-stack-web-developer';
 INSERT dbo.MilestoneSkills(MilestoneId,SkillId) SELECT m.MilestoneId,s.SkillId FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId JOIN dbo.Skills s ON s.Slug='web-development' WHERE p.Slug='full-stack-web-developer' AND m.SequenceNo=1 AND NOT EXISTS (SELECT 1 FROM dbo.MilestoneSkills ms WHERE ms.MilestoneId=m.MilestoneId AND ms.SkillId=s.SkillId);
 IF NOT EXISTS (SELECT 1 FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId WHERE p.Slug='full-stack-web-developer' AND m.SequenceNo=2)
  INSERT dbo.CareerMilestones(CareerPathId,Title,Description,SequenceNo,EstimatedHours) SELECT CareerPathId,N'JavaScript Fundamentals',N'Add interactive browser behavior',2,22 FROM dbo.CareerPaths WHERE Slug='full-stack-web-developer';
 INSERT dbo.MilestoneSkills(MilestoneId,SkillId) SELECT m.MilestoneId,s.SkillId FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId JOIN dbo.Skills s ON s.Slug='javascript' WHERE p.Slug='full-stack-web-developer' AND m.SequenceNo=2 AND NOT EXISTS (SELECT 1 FROM dbo.MilestoneSkills ms WHERE ms.MilestoneId=m.MilestoneId AND ms.SkillId=s.SkillId);
 IF NOT EXISTS (SELECT 1 FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId WHERE p.Slug='full-stack-web-developer' AND m.SequenceNo=3)
  INSERT dbo.CareerMilestones(CareerPathId,Title,Description,SequenceNo,EstimatedHours) SELECT CareerPathId,N'React Frontend',N'Build reusable UI components',3,26 FROM dbo.CareerPaths WHERE Slug='full-stack-web-developer';
 INSERT dbo.MilestoneSkills(MilestoneId,SkillId) SELECT m.MilestoneId,s.SkillId FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId JOIN dbo.Skills s ON s.Slug='react' WHERE p.Slug='full-stack-web-developer' AND m.SequenceNo=3 AND NOT EXISTS (SELECT 1 FROM dbo.MilestoneSkills ms WHERE ms.MilestoneId=m.MilestoneId AND ms.SkillId=s.SkillId);
 IF NOT EXISTS (SELECT 1 FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId WHERE p.Slug='full-stack-web-developer' AND m.SequenceNo=4)
  INSERT dbo.CareerMilestones(CareerPathId,Title,Description,SequenceNo,EstimatedHours) SELECT CareerPathId,N'Version Control & Collaboration',N'Track and review code changes',4,10 FROM dbo.CareerPaths WHERE Slug='full-stack-web-developer';
 INSERT dbo.MilestoneSkills(MilestoneId,SkillId) SELECT m.MilestoneId,s.SkillId FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId JOIN dbo.Skills s ON s.Slug='git-github' WHERE p.Slug='full-stack-web-developer' AND m.SequenceNo=4 AND NOT EXISTS (SELECT 1 FROM dbo.MilestoneSkills ms WHERE ms.MilestoneId=m.MilestoneId AND ms.SkillId=s.SkillId);
 IF NOT EXISTS (SELECT 1 FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId WHERE p.Slug='ui-ux-designer' AND m.SequenceNo=1)
  INSERT dbo.CareerMilestones(CareerPathId,Title,Description,SequenceNo,EstimatedHours) SELECT CareerPathId,N'UX Research & User Flows',N'Understand user needs and journeys',1,14 FROM dbo.CareerPaths WHERE Slug='ui-ux-designer';
 INSERT dbo.MilestoneSkills(MilestoneId,SkillId) SELECT m.MilestoneId,s.SkillId FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId JOIN dbo.Skills s ON s.Slug='ui-ux-design' WHERE p.Slug='ui-ux-designer' AND m.SequenceNo=1 AND NOT EXISTS (SELECT 1 FROM dbo.MilestoneSkills ms WHERE ms.MilestoneId=m.MilestoneId AND ms.SkillId=s.SkillId);
 IF NOT EXISTS (SELECT 1 FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId WHERE p.Slug='ui-ux-designer' AND m.SequenceNo=2)
  INSERT dbo.CareerMilestones(CareerPathId,Title,Description,SequenceNo,EstimatedHours) SELECT CareerPathId,N'Wireframes & Prototypes',N'Create interactive interface prototypes',2,20 FROM dbo.CareerPaths WHERE Slug='ui-ux-designer';
 INSERT dbo.MilestoneSkills(MilestoneId,SkillId) SELECT m.MilestoneId,s.SkillId FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId JOIN dbo.Skills s ON s.Slug='ui-ux-design' WHERE p.Slug='ui-ux-designer' AND m.SequenceNo=2 AND NOT EXISTS (SELECT 1 FROM dbo.MilestoneSkills ms WHERE ms.MilestoneId=m.MilestoneId AND ms.SkillId=s.SkillId);
 IF NOT EXISTS (SELECT 1 FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId WHERE p.Slug='ui-ux-designer' AND m.SequenceNo=3)
  INSERT dbo.CareerMilestones(CareerPathId,Title,Description,SequenceNo,EstimatedHours) SELECT CareerPathId,N'Usability Testing',N'Evaluate and improve designs',3,12 FROM dbo.CareerPaths WHERE Slug='ui-ux-designer';
 INSERT dbo.MilestoneSkills(MilestoneId,SkillId) SELECT m.MilestoneId,s.SkillId FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId JOIN dbo.Skills s ON s.Slug='ui-ux-design' WHERE p.Slug='ui-ux-designer' AND m.SequenceNo=3 AND NOT EXISTS (SELECT 1 FROM dbo.MilestoneSkills ms WHERE ms.MilestoneId=m.MilestoneId AND ms.SkillId=s.SkillId);
 IF NOT EXISTS (SELECT 1 FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId WHERE p.Slug='mobile-app-developer' AND m.SequenceNo=1)
  INSERT dbo.CareerMilestones(CareerPathId,Title,Description,SequenceNo,EstimatedHours) SELECT CareerPathId,N'Programming Foundations',N'Understand app programming concepts',1,18 FROM dbo.CareerPaths WHERE Slug='mobile-app-developer';
 IF NOT EXISTS (SELECT 1 FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId WHERE p.Slug='mobile-app-developer' AND m.SequenceNo=2)
  INSERT dbo.CareerMilestones(CareerPathId,Title,Description,SequenceNo,EstimatedHours) SELECT CareerPathId,N'Mobile UI Design',N'Plan mobile-first interactions',2,20 FROM dbo.CareerPaths WHERE Slug='mobile-app-developer';
 INSERT dbo.MilestoneSkills(MilestoneId,SkillId) SELECT m.MilestoneId,s.SkillId FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId JOIN dbo.Skills s ON s.Slug='ui-ux-design' WHERE p.Slug='mobile-app-developer' AND m.SequenceNo=2 AND NOT EXISTS (SELECT 1 FROM dbo.MilestoneSkills ms WHERE ms.MilestoneId=m.MilestoneId AND ms.SkillId=s.SkillId);
 IF NOT EXISTS (SELECT 1 FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId WHERE p.Slug='mobile-app-developer' AND m.SequenceNo=3)
  INSERT dbo.CareerMilestones(CareerPathId,Title,Description,SequenceNo,EstimatedHours) SELECT CareerPathId,N'App Development Practice',N'Build and test a sample mobile app',3,28 FROM dbo.CareerPaths WHERE Slug='mobile-app-developer';
 IF NOT EXISTS (SELECT 1 FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId WHERE p.Slug='data-scientist' AND m.SequenceNo=1)
  INSERT dbo.CareerMilestones(CareerPathId,Title,Description,SequenceNo,EstimatedHours) SELECT CareerPathId,N'Python Foundations',N'Work with Python fundamentals',1,24 FROM dbo.CareerPaths WHERE Slug='data-scientist';
 INSERT dbo.MilestoneSkills(MilestoneId,SkillId) SELECT m.MilestoneId,s.SkillId FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId JOIN dbo.Skills s ON s.Slug='python' WHERE p.Slug='data-scientist' AND m.SequenceNo=1 AND NOT EXISTS (SELECT 1 FROM dbo.MilestoneSkills ms WHERE ms.MilestoneId=m.MilestoneId AND ms.SkillId=s.SkillId);
 IF NOT EXISTS (SELECT 1 FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId WHERE p.Slug='data-scientist' AND m.SequenceNo=2)
  INSERT dbo.CareerMilestones(CareerPathId,Title,Description,SequenceNo,EstimatedHours) SELECT CareerPathId,N'Data Exploration',N'Clean and analyze datasets',2,26 FROM dbo.CareerPaths WHERE Slug='data-scientist';
 IF NOT EXISTS (SELECT 1 FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId WHERE p.Slug='data-scientist' AND m.SequenceNo=3)
  INSERT dbo.CareerMilestones(CareerPathId,Title,Description,SequenceNo,EstimatedHours) SELECT CareerPathId,N'Machine Learning Basics',N'Understand modeling and evaluation',3,30 FROM dbo.CareerPaths WHERE Slug='data-scientist';
 IF NOT EXISTS (SELECT 1 FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId WHERE p.Slug='devops-engineer' AND m.SequenceNo=1)
  INSERT dbo.CareerMilestones(CareerPathId,Title,Description,SequenceNo,EstimatedHours) SELECT CareerPathId,N'Git & Collaboration',N'Practice version control workflows',1,12 FROM dbo.CareerPaths WHERE Slug='devops-engineer';
 INSERT dbo.MilestoneSkills(MilestoneId,SkillId) SELECT m.MilestoneId,s.SkillId FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId JOIN dbo.Skills s ON s.Slug='git-github' WHERE p.Slug='devops-engineer' AND m.SequenceNo=1 AND NOT EXISTS (SELECT 1 FROM dbo.MilestoneSkills ms WHERE ms.MilestoneId=m.MilestoneId AND ms.SkillId=s.SkillId);
 IF NOT EXISTS (SELECT 1 FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId WHERE p.Slug='devops-engineer' AND m.SequenceNo=2)
  INSERT dbo.CareerMilestones(CareerPathId,Title,Description,SequenceNo,EstimatedHours) SELECT CareerPathId,N'Deployment Fundamentals',N'Understand delivery environments',2,20 FROM dbo.CareerPaths WHERE Slug='devops-engineer';
 IF NOT EXISTS (SELECT 1 FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId WHERE p.Slug='devops-engineer' AND m.SequenceNo=3)
  INSERT dbo.CareerMilestones(CareerPathId,Title,Description,SequenceNo,EstimatedHours) SELECT CareerPathId,N'CI/CD Pipelines',N'Automate build and deployment workflows',3,26 FROM dbo.CareerPaths WHERE Slug='devops-engineer';
 IF NOT EXISTS (SELECT 1 FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId WHERE p.Slug='graphic-designer' AND m.SequenceNo=1)
  INSERT dbo.CareerMilestones(CareerPathId,Title,Description,SequenceNo,EstimatedHours) SELECT CareerPathId,N'Design Principles',N'Learn visual hierarchy and color',1,16 FROM dbo.CareerPaths WHERE Slug='graphic-designer';
 INSERT dbo.MilestoneSkills(MilestoneId,SkillId) SELECT m.MilestoneId,s.SkillId FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId JOIN dbo.Skills s ON s.Slug='graphic-design' WHERE p.Slug='graphic-designer' AND m.SequenceNo=1 AND NOT EXISTS (SELECT 1 FROM dbo.MilestoneSkills ms WHERE ms.MilestoneId=m.MilestoneId AND ms.SkillId=s.SkillId);
 IF NOT EXISTS (SELECT 1 FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId WHERE p.Slug='graphic-designer' AND m.SequenceNo=2)
  INSERT dbo.CareerMilestones(CareerPathId,Title,Description,SequenceNo,EstimatedHours) SELECT CareerPathId,N'Brand Identity',N'Develop cohesive visual assets',2,22 FROM dbo.CareerPaths WHERE Slug='graphic-designer';
 INSERT dbo.MilestoneSkills(MilestoneId,SkillId) SELECT m.MilestoneId,s.SkillId FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId JOIN dbo.Skills s ON s.Slug='graphic-design' WHERE p.Slug='graphic-designer' AND m.SequenceNo=2 AND NOT EXISTS (SELECT 1 FROM dbo.MilestoneSkills ms WHERE ms.MilestoneId=m.MilestoneId AND ms.SkillId=s.SkillId);
 IF NOT EXISTS (SELECT 1 FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId WHERE p.Slug='graphic-designer' AND m.SequenceNo=3)
  INSERT dbo.CareerMilestones(CareerPathId,Title,Description,SequenceNo,EstimatedHours) SELECT CareerPathId,N'Portfolio Project',N'Create and present design work',3,20 FROM dbo.CareerPaths WHERE Slug='graphic-designer';
 INSERT dbo.MilestoneSkills(MilestoneId,SkillId) SELECT m.MilestoneId,s.SkillId FROM dbo.CareerMilestones m JOIN dbo.CareerPaths p ON p.CareerPathId=m.CareerPathId JOIN dbo.Skills s ON s.Slug='graphic-design' WHERE p.Slug='graphic-designer' AND m.SequenceNo=3 AND NOT EXISTS (SELECT 1 FROM dbo.MilestoneSkills ms WHERE ms.MilestoneId=m.MilestoneId AND ms.SkillId=s.SkillId);
 COMMIT TRANSACTION;
 SELECT N'CareerMilestones' AS TableName, COUNT(*) AS TotalRows FROM dbo.CareerMilestones
 UNION ALL SELECT N'MilestoneSkills',COUNT(*) FROM dbo.MilestoneSkills;
 PRINT N'Career milestones seed completed successfully.';
END TRY
BEGIN CATCH
 IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
 THROW;
END CATCH;

GO


-- ===== 07: 07_SkillsSwapDB_Instructors_Courses =====
/* Skills Swap | demo instructor profiles + courses + lessons.
   Run AFTER 01, 05 and 06 on SkillsSwapDB.
   Demo identities have NULL PasswordHash: they CANNOT sign in until properly provisioned
   using ASP.NET Core Identity UserManager. Do not use these as real accounts.
   Rerunnable: checks existing IDs, titles and lesson order. */
USE [SkillsSwapDB];
SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRY
 BEGIN TRANSACTION;
 DECLARE @Demo TABLE (UserId NVARCHAR(450), FullName NVARCHAR(150), Email NVARCHAR(256));
 INSERT INTO @Demo VALUES
 (N'demo-instructor-python',N'Ahmad Khalil',N'ahmad.python@demo.skillsswap.test'),
 (N'demo-instructor-ux',N'Lina Haddad',N'lina.ux@demo.skillsswap.test'),
 (N'demo-instructor-js',N'Omar Nasser',N'omar.js@demo.skillsswap.test'),
 (N'demo-instructor-design',N'Rana Saleh',N'rana.design@demo.skillsswap.test'),
 (N'demo-instructor-react',N'Yazan Ali',N'yazan.react@demo.skillsswap.test'),
 (N'demo-instructor-photo',N'Maya Hasan',N'maya.photo@demo.skillsswap.test');
 IF EXISTS (SELECT 1 FROM @Demo d JOIN dbo.AspNetUsers u ON u.NormalizedEmail=UPPER(d.Email) AND u.Id<>d.UserId)
  THROW 51101, 'Demo email already belongs to a different user.', 1;
 INSERT INTO dbo.AspNetUsers
 (Id,UserName,NormalizedUserName,Email,NormalizedEmail,EmailConfirmed,
  PasswordHash,SecurityStamp,ConcurrencyStamp,PhoneNumberConfirmed,
  TwoFactorEnabled,LockoutEnabled,AccessFailedCount)
 SELECT d.UserId,d.Email,UPPER(d.Email),d.Email,UPPER(d.Email),0,
        NULL,CONVERT(NVARCHAR(36),NEWID()),CONVERT(NVARCHAR(36),NEWID()),0,0,0,0
 FROM @Demo d WHERE NOT EXISTS (SELECT 1 FROM dbo.AspNetUsers u WHERE u.Id=d.UserId);
 INSERT INTO dbo.UserProfiles(UserId,FullName,Bio)
 SELECT d.UserId,d.FullName,N'Demo instructor profile for Skills Swap.'
 FROM @Demo d WHERE NOT EXISTS (SELECT 1 FROM dbo.UserProfiles p WHERE p.UserId=d.UserId);
 DECLARE @Courses TABLE (Title NVARCHAR(200), UserId NVARCHAR(450), SkillSlug VARCHAR(140), Level VARCHAR(20), Description NVARCHAR(500));
 INSERT INTO @Courses VALUES
 (N'Python Programming',N'demo-instructor-python','python-programming','Beginner',N'Learn Python syntax, functions, and basic projects.'),
 (N'UI/UX Design',N'demo-instructor-ux','ui-ux-design','Beginner',N'Learn user research, wireframes, and prototyping.'),
 (N'Advanced JavaScript',N'demo-instructor-js','advanced-javascript','Advanced',N'Explore asynchronous JavaScript and advanced patterns.'),
 (N'Graphic Design Masterclass',N'demo-instructor-design','graphic-design-masterclass','Intermediate',N'Learn composition, typography, and visual branding.'),
 (N'React Development',N'demo-instructor-react','react-development','Advanced',N'Build component-based interfaces using React.'),
 (N'Photography Basics',N'demo-instructor-photo','photography-basics','Beginner',N'Learn exposure, lighting, and composition.');
 IF EXISTS (SELECT 1 FROM @Courses c LEFT JOIN dbo.Skills s ON s.Slug=c.SkillSlug WHERE s.SkillId IS NULL)
  THROW 51102, 'Missing prerequisite Skills. Run 05 SeedData first.', 1;
 IF EXISTS (SELECT 1 FROM @Courses c JOIN dbo.Courses x ON x.Title=c.Title AND x.InstructorUserId<>c.UserId)
  THROW 51103, 'A course title already belongs to another instructor; review manually.', 1;
 INSERT INTO dbo.Courses(InstructorUserId,SkillId,Title,Description,Level,Status,PublishedAt)
 SELECT c.UserId,s.SkillId,c.Title,c.Description,c.Level,'Published',SYSUTCDATETIME()
 FROM @Courses c JOIN dbo.Skills s ON s.Slug=c.SkillSlug
 WHERE NOT EXISTS (SELECT 1 FROM dbo.Courses x WHERE x.Title=c.Title AND x.InstructorUserId=c.UserId);
 DECLARE @Lessons TABLE (CourseTitle NVARCHAR(200), LessonOrder INT, Title NVARCHAR(200), DurationMinutes INT);
 INSERT INTO @Lessons VALUES
 (N'Python Programming',1,N'Introduction to Python',20),(N'Python Programming',2,N'Variables and Data Types',30),(N'Python Programming',3,N'Functions and Practice',35),
 (N'UI/UX Design',1,N'User-Centered Design',25),(N'UI/UX Design',2,N'Wireframes and User Flows',30),(N'UI/UX Design',3,N'Prototyping Basics',35),
 (N'Advanced JavaScript',1,N'Modern JavaScript Review',25),(N'Advanced JavaScript',2,N'Promises and Async/Await',40),(N'Advanced JavaScript',3,N'Advanced Patterns',40),
 (N'Graphic Design Masterclass',1,N'Design Principles',25),(N'Graphic Design Masterclass',2,N'Typography and Color',30),(N'Graphic Design Masterclass',3,N'Branding Exercise',40),
 (N'React Development',1,N'Components and JSX',30),(N'React Development',2,N'State and Props',35),(N'React Development',3,N'Building a React Interface',45),
 (N'Photography Basics',1,N'Camera Fundamentals',20),(N'Photography Basics',2,N'Exposure and Lighting',30),(N'Photography Basics',3,N'Composition Practice',35);
 INSERT INTO dbo.CourseLessons(CourseId,Title,LessonOrder,DurationMinutes,IsPublished)
 SELECT c.CourseId,l.Title,l.LessonOrder,l.DurationMinutes,1
 FROM @Lessons l JOIN @Courses dc ON dc.Title=l.CourseTitle
 JOIN dbo.Courses c ON c.Title=dc.Title AND c.InstructorUserId=dc.UserId
 WHERE NOT EXISTS (SELECT 1 FROM dbo.CourseLessons existing WHERE existing.CourseId=c.CourseId AND existing.LessonOrder=l.LessonOrder);
 COMMIT TRANSACTION;
 SELECT 'AspNetUsers (demo instructors)' AS Entity,COUNT(*) AS Total FROM dbo.AspNetUsers WHERE Id LIKE N'demo-instructor-%'
 UNION ALL SELECT 'Courses',COUNT(*) FROM dbo.Courses
 UNION ALL SELECT 'CourseLessons',COUNT(*) FROM dbo.CourseLessons;
 PRINT 'Demo instructors, courses and lessons seeded successfully.';
END TRY
BEGIN CATCH
 IF @@TRANCOUNT>0 ROLLBACK TRANSACTION;
 THROW;
END CATCH;

GO


-- ===== 08: 08_SkillsSwapDB_MilestoneResources =====
USE [SkillsSwapDB];
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    -- Match each existing course to an appropriate career-path milestone.
    -- Resolve IDs through stable career-path slugs, milestone sequence numbers,
    -- and exact course titles; never assume IDENTITY values.
    DECLARE @Mappings TABLE
    (
        PathSlug VARCHAR(150) NOT NULL,
        MilestoneSequence INT NOT NULL,
        CourseTitle NVARCHAR(200) NOT NULL
    );

    INSERT INTO @Mappings (PathSlug, MilestoneSequence, CourseTitle)
    VALUES
      ('full-stack-web-developer', 2, N'Advanced JavaScript'),
      ('full-stack-web-developer', 3, N'React Development'),
      ('ui-ux-designer', 2, N'UI/UX Design'),
      ('mobile-app-developer', 2, N'UI/UX Design'),
      ('data-scientist', 1, N'Python Programming'),
      ('graphic-designer', 1, N'Graphic Design Masterclass');

    -- Abort instead of silently omitting a resource if a required row is missing.
    IF EXISTS
    (
        SELECT 1
        FROM @Mappings x
        LEFT JOIN dbo.CareerPaths p ON p.Slug = x.PathSlug
        LEFT JOIN dbo.CareerMilestones m
            ON m.CareerPathId = p.CareerPathId AND m.SequenceNo = x.MilestoneSequence
        LEFT JOIN dbo.Courses c ON c.Title = x.CourseTitle AND c.Status = 'Published'
        WHERE m.MilestoneId IS NULL OR c.CourseId IS NULL
    )
        THROW 51201, 'Missing career milestone or published course required by resource mappings.', 1;

    -- Check for ambiguous titles (avoid mapping to an arbitrary duplicate course).
    IF EXISTS
    (
        SELECT 1
        FROM @Mappings x
        INNER JOIN dbo.Courses c ON c.Title = x.CourseTitle AND c.Status = 'Published'
        GROUP BY x.PathSlug, x.MilestoneSequence, x.CourseTitle
        HAVING COUNT(*) <> 1
    )
        THROW 51202, 'More than one published course has a mapped title.', 1;

    -- Preserve existing resource order; append each new course resource.
    DECLARE @MilestoneId INT, @CourseId INT, @Title NVARCHAR(200), @NextOrder INT;
    DECLARE resource_cursor CURSOR LOCAL FAST_FORWARD FOR
        SELECT m.MilestoneId, c.CourseId, c.Title
        FROM @Mappings x
        JOIN dbo.CareerPaths p ON p.Slug = x.PathSlug
        JOIN dbo.CareerMilestones m
            ON m.CareerPathId = p.CareerPathId AND m.SequenceNo = x.MilestoneSequence
        JOIN dbo.Courses c ON c.Title = x.CourseTitle AND c.Status = 'Published'
        ORDER BY m.MilestoneId, c.CourseId;

    OPEN resource_cursor;
    FETCH NEXT FROM resource_cursor INTO @MilestoneId, @CourseId, @Title;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        IF NOT EXISTS
        (
            SELECT 1 FROM dbo.MilestoneResources
            WHERE MilestoneId = @MilestoneId AND CourseId = @CourseId
        )
        BEGIN
            SELECT @NextOrder = ISNULL(MAX(ResourceOrder), 0) + 1
            FROM dbo.MilestoneResources WITH (UPDLOCK, HOLDLOCK)
            WHERE MilestoneId = @MilestoneId;

            INSERT INTO dbo.MilestoneResources
                (MilestoneId, CourseId, Title, ExternalUrl, ResourceOrder)
            VALUES
                (@MilestoneId, @CourseId, @Title, NULL, @NextOrder);
        END;
        FETCH NEXT FROM resource_cursor INTO @MilestoneId, @CourseId, @Title;
    END;
    CLOSE resource_cursor;
    DEALLOCATE resource_cursor;

    COMMIT TRANSACTION;
    PRINT 'Milestone resources seed completed successfully.';

    SELECT p.Title AS CareerPath, m.Title AS Milestone,
           c.Title AS Course, r.ResourceOrder
    FROM dbo.MilestoneResources r
    JOIN dbo.CareerMilestones m ON m.MilestoneId = r.MilestoneId
    JOIN dbo.CareerPaths p ON p.CareerPathId = m.CareerPathId
    JOIN dbo.Courses c ON c.CourseId = r.CourseId
    ORDER BY p.Title, m.SequenceNo, r.ResourceOrder;
END TRY
BEGIN CATCH
    IF CURSOR_STATUS('local', 'resource_cursor') >= -1
    BEGIN
        IF CURSOR_STATUS('local', 'resource_cursor') >= 0 CLOSE resource_cursor;
        DEALLOCATE resource_cursor;
    END;
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

GO


-- ===== 09: 09_SkillsSwapDB_SwapDemo =====
/* Skills Swap | demo users, teaching skills, swaps, messages, meetings.
   Run after 01, 05, 06, 07, 08. All demo accounts have NULL PasswordHash;
   provision login accounts later using ASP.NET Core Identity UserManager.
   Safe to rerun: demo keys, swaps and messages are checked before insertion. */
USE [SkillsSwapDB];
SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRY
 BEGIN TRANSACTION;
 DECLARE @People TABLE (UserId NVARCHAR(450), FullName NVARCHAR(150), Email NVARCHAR(256));
 INSERT INTO @People VALUES
 (N'demo-member-sara',N'Sara Ahmad',N'sara.member@demo.skillsswap.test'),
 (N'demo-member-khaled',N'Khaled Mansour',N'khaled.member@demo.skillsswap.test'),
 (N'demo-member-noor',N'Noor Ibrahim',N'noor.member@demo.skillsswap.test');
 IF EXISTS (SELECT 1 FROM @People p JOIN dbo.AspNetUsers u ON u.NormalizedEmail=UPPER(p.Email) AND u.Id<>p.UserId)
  THROW 51201,'Demo email belongs to a different user.',1;
 INSERT INTO dbo.AspNetUsers
 (Id,UserName,NormalizedUserName,Email,NormalizedEmail,EmailConfirmed,PasswordHash,
 SecurityStamp,ConcurrencyStamp,PhoneNumberConfirmed,TwoFactorEnabled,LockoutEnabled,AccessFailedCount)
 SELECT p.UserId,p.Email,UPPER(p.Email),p.Email,UPPER(p.Email),0,NULL,
 CONVERT(NVARCHAR(36),NEWID()),CONVERT(NVARCHAR(36),NEWID()),0,0,0,0
 FROM @People p WHERE NOT EXISTS (SELECT 1 FROM dbo.AspNetUsers u WHERE u.Id=p.UserId);
 INSERT INTO dbo.UserProfiles(UserId,FullName,Bio)
 SELECT p.UserId,p.FullName,N'Skills Swap demo member.' FROM @People p
 WHERE NOT EXISTS (SELECT 1 FROM dbo.UserProfiles x WHERE x.UserId=p.UserId);
 DECLARE @Teaching TABLE (UserId NVARCHAR(450), Slug VARCHAR(140), Level VARCHAR(20));
 INSERT INTO @Teaching VALUES
 (N'demo-instructor-python','python-programming','Expert'),
 (N'demo-instructor-ux','ui-ux-design','Expert'),
 (N'demo-instructor-js','advanced-javascript','Expert'),
 (N'demo-instructor-react','react-development','Expert'),
 (N'demo-member-sara','ui-ux-design','Intermediate'),
 (N'demo-member-khaled','python-programming','Advanced'),
 (N'demo-member-noor','react-development','Intermediate');
 IF EXISTS (SELECT 1 FROM @Teaching t LEFT JOIN dbo.Skills s ON s.Slug=t.Slug WHERE s.SkillId IS NULL)
  THROW 51202,'A required skill slug is missing. Run seed 05.',1;
 IF EXISTS (SELECT 1 FROM @Teaching t LEFT JOIN dbo.AspNetUsers u ON u.Id=t.UserId WHERE u.Id IS NULL)
  THROW 51203,'A required demo user is missing. Run seed 07.',1;
 INSERT INTO dbo.UserSkills(UserId,SkillId,Intent,ProficiencyLevel,Description)
 SELECT t.UserId,s.SkillId,'Teach',t.Level,N'Demo teaching skill.'
 FROM @Teaching t JOIN dbo.Skills s ON s.Slug=t.Slug
 WHERE NOT EXISTS (SELECT 1 FROM dbo.UserSkills x WHERE x.UserId=t.UserId AND x.SkillId=s.SkillId AND x.Intent='Teach');
 DECLARE @Swaps TABLE (Sender NVARCHAR(450), Receiver NVARCHAR(450), OfferedSlug VARCHAR(140), RequestedSlug VARCHAR(140), SwapStatus VARCHAR(20), Note NVARCHAR(200));
 INSERT INTO @Swaps VALUES
 (N'demo-member-sara',N'demo-member-khaled','ui-ux-design','python-programming','Accepted',N'I can help with UX in exchange for Python practice.'),
 (N'demo-member-khaled',N'demo-member-noor','python-programming','react-development','Pending',N'Interested in React and happy to teach Python.'),
 (N'demo-member-noor',N'demo-member-sara','react-development','ui-ux-design','InProgress',N'Let us exchange React and UI/UX skills.');
 IF EXISTS (
  SELECT 1 FROM @Swaps x
  LEFT JOIN dbo.Skills os ON os.Slug=x.OfferedSlug
  LEFT JOIN dbo.UserSkills ou ON ou.UserId=x.Sender AND ou.SkillId=os.SkillId AND ou.Intent='Teach'
  LEFT JOIN dbo.Skills rs ON rs.Slug=x.RequestedSlug
  LEFT JOIN dbo.UserSkills ru ON ru.UserId=x.Receiver AND ru.SkillId=rs.SkillId AND ru.Intent='Teach'
  WHERE ou.UserSkillId IS NULL OR ru.UserSkillId IS NULL)
  THROW 51204,'Teaching skill ownership missing for a swap.',1;
 INSERT INTO dbo.SwapRequests(SenderUserId,ReceiverUserId,OfferedUserSkillId,RequestedUserSkillId,Status,Message,RespondedAt)
 SELECT x.Sender,x.Receiver,ou.UserSkillId,ru.UserSkillId,x.SwapStatus,x.Note,
 CASE WHEN x.SwapStatus='Pending' THEN NULL ELSE SYSUTCDATETIME() END
 FROM @Swaps x
 JOIN dbo.Skills os ON os.Slug=x.OfferedSlug
 JOIN dbo.UserSkills ou ON ou.UserId=x.Sender AND ou.SkillId=os.SkillId AND ou.Intent='Teach'
 JOIN dbo.Skills rs ON rs.Slug=x.RequestedSlug
 JOIN dbo.UserSkills ru ON ru.UserId=x.Receiver AND ru.SkillId=rs.SkillId AND ru.Intent='Teach'
 WHERE NOT EXISTS (SELECT 1 FROM dbo.SwapRequests sr
 WHERE sr.SenderUserId=x.Sender AND sr.ReceiverUserId=x.Receiver
 AND sr.OfferedUserSkillId=ou.UserSkillId AND sr.RequestedUserSkillId=ru.UserSkillId);
 INSERT INTO dbo.Conversations(SwapRequestId)
 SELECT sr.SwapRequestId FROM dbo.SwapRequests sr
 JOIN @Swaps x ON x.Sender=sr.SenderUserId AND x.Receiver=sr.ReceiverUserId
 WHERE NOT EXISTS (SELECT 1 FROM dbo.Conversations c WHERE c.SwapRequestId=sr.SwapRequestId);
 INSERT INTO dbo.ConversationMembers(ConversationId,UserId)
 SELECT c.ConversationId,v.UserId FROM dbo.Conversations c
 JOIN dbo.SwapRequests sr ON sr.SwapRequestId=c.SwapRequestId
 JOIN @Swaps x ON x.Sender=sr.SenderUserId AND x.Receiver=sr.ReceiverUserId
 CROSS APPLY (VALUES(sr.SenderUserId),(sr.ReceiverUserId)) v(UserId)
 WHERE NOT EXISTS (SELECT 1 FROM dbo.ConversationMembers m WHERE m.ConversationId=c.ConversationId AND m.UserId=v.UserId);
 INSERT INTO dbo.Messages(ConversationId,SenderUserId,Body)
 SELECT c.ConversationId,sr.SenderUserId,N'Hello! I would love to exchange skills with you.'
 FROM dbo.Conversations c JOIN dbo.SwapRequests sr ON sr.SwapRequestId=c.SwapRequestId
 JOIN @Swaps x ON x.Sender=sr.SenderUserId AND x.Receiver=sr.ReceiverUserId
 WHERE NOT EXISTS (SELECT 1 FROM dbo.Messages m WHERE m.ConversationId=c.ConversationId AND m.SenderUserId=sr.SenderUserId AND m.Body=N'Hello! I would love to exchange skills with you.');
 INSERT INTO dbo.Messages(ConversationId,SenderUserId,Body)
 SELECT c.ConversationId,sr.ReceiverUserId,N'Thanks! Let us plan a learning session.'
 FROM dbo.Conversations c JOIN dbo.SwapRequests sr ON sr.SwapRequestId=c.SwapRequestId
 JOIN @Swaps x ON x.Sender=sr.SenderUserId AND x.Receiver=sr.ReceiverUserId
 WHERE NOT EXISTS (SELECT 1 FROM dbo.Messages m WHERE m.ConversationId=c.ConversationId AND m.SenderUserId=sr.ReceiverUserId AND m.Body=N'Thanks! Let us plan a learning session.');
 INSERT INTO dbo.Meetings(SwapRequestId,StartAt,EndAt,Status,Provider)
 SELECT sr.SwapRequestId,DATEADD(DAY,7,SYSUTCDATETIME()),DATEADD(MINUTE,60,DATEADD(DAY,7,SYSUTCDATETIME())),'Scheduled','Zoom'
 FROM dbo.SwapRequests sr JOIN @Swaps x ON x.Sender=sr.SenderUserId AND x.Receiver=sr.ReceiverUserId
 WHERE sr.Status IN ('Accepted','InProgress') AND NOT EXISTS (SELECT 1 FROM dbo.Meetings mt WHERE mt.SwapRequestId=sr.SwapRequestId);
 COMMIT TRANSACTION;
 SELECT 'Demo members' AS Entity,COUNT(*) AS Total FROM dbo.AspNetUsers WHERE Id LIKE N'demo-member-%'
 UNION ALL SELECT 'Teaching skills (demo)',COUNT(*) FROM dbo.UserSkills WHERE UserId LIKE N'demo-%' AND Intent='Teach'
 UNION ALL SELECT 'Demo swap requests',COUNT(*) FROM dbo.SwapRequests WHERE SenderUserId LIKE N'demo-member-%'
 UNION ALL SELECT 'Demo conversations',COUNT(*) FROM dbo.Conversations c JOIN dbo.SwapRequests s ON s.SwapRequestId=c.SwapRequestId WHERE s.SenderUserId LIKE N'demo-member-%'
 UNION ALL SELECT 'Demo messages',COUNT(*) FROM dbo.Messages m JOIN dbo.Conversations c ON c.ConversationId=m.ConversationId JOIN dbo.SwapRequests s ON s.SwapRequestId=c.SwapRequestId WHERE s.SenderUserId LIKE N'demo-member-%'
 UNION ALL SELECT 'Demo meetings',COUNT(*) FROM dbo.Meetings m JOIN dbo.SwapRequests s ON s.SwapRequestId=m.SwapRequestId WHERE s.SenderUserId LIKE N'demo-member-%';
 PRINT 'Demo swap and communication data seeded successfully.';
END TRY
BEGIN CATCH
 IF @@TRANCOUNT>0 ROLLBACK TRANSACTION;
 THROW;
END CATCH;

GO


-- ===== 10: 10_SkillsSwapDB_Experts_Subscriptions =====
/* Skills Swap — 10: Experts, bookings, subscriptions, payments, reviews, notifications,
   career enrollments and milestone progress. Demo data only. Run after 01,05-09.
   Idempotent for the supplied demo keys; no real payment processing or credentials. */
USE [SkillsSwapDB];
SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRY
 BEGIN TRANSACTION;
 IF NOT EXISTS (SELECT 1 FROM dbo.AspNetUsers WHERE Id=N'demo-instructor-python')
    OR NOT EXISTS (SELECT 1 FROM dbo.AspNetUsers WHERE Id=N'demo-instructor-ux')
    OR NOT EXISTS (SELECT 1 FROM dbo.AspNetUsers WHERE Id=N'demo-member-sara')
    OR NOT EXISTS (SELECT 1 FROM dbo.AspNetUsers WHERE Id=N'demo-member-khaled')
    THROW 51301, 'Required demo users missing. Run 07 and 09 first.', 1;

 -- Experts
 INSERT INTO dbo.ExpertProfiles(UserId,Headline,Biography,HourlyRate,Currency,VerificationStatus,VerifiedAt)
 SELECT v.UserId,v.Headline,v.Biography,v.Rate,'JOD','Approved',SYSUTCDATETIME()
 FROM (VALUES
 (N'demo-instructor-python',N'Python mentor',N'Demo instructor specializing in Python fundamentals.',CAST(18.00 AS DECIMAL(10,2))),
 (N'demo-instructor-ux',N'UI/UX design mentor',N'Demo instructor specializing in wireframes and prototypes.',CAST(22.00 AS DECIMAL(10,2)))
 ) v(UserId,Headline,Biography,Rate)
 WHERE NOT EXISTS (SELECT 1 FROM dbo.ExpertProfiles e WHERE e.UserId=v.UserId);

 -- Subscription: select a real seeded plan by billing period, not a hardcoded ID.
 DECLARE @FreePlanId INT = (SELECT TOP (1) PlanId FROM dbo.SubscriptionPlans WHERE BillingPeriod='None' AND Price=0 ORDER BY PlanId);
 DECLARE @PaidPlanId INT = (SELECT TOP (1) PlanId FROM dbo.SubscriptionPlans WHERE BillingPeriod='Monthly' AND Price>0 ORDER BY Price,PlanId);
 IF @FreePlanId IS NULL OR @PaidPlanId IS NULL THROW 51302,'Free or monthly paid plan missing. Run 05.',1;
 INSERT INTO dbo.UserSubscriptions(UserId,PlanId,Status,StartAt)
 SELECT v.UserId,v.PlanId,'Active',CONVERT(DATETIME2(3),'2026-11-01T10:00:00')
 FROM (VALUES (N'demo-member-sara',@FreePlanId),(N'demo-member-khaled',@PaidPlanId)) v(UserId,PlanId)
 WHERE NOT EXISTS (SELECT 1 FROM dbo.UserSubscriptions s WHERE s.UserId=v.UserId AND s.Status IN ('Active','Trialing'));

 -- One illustrative paid subscription payment, no real card data or gateway reference.
 INSERT INTO dbo.Payments(SubscriptionId,Amount,Currency,Status,Provider,PaidAt)
 SELECT s.SubscriptionId,p.Price,p.Currency,'Succeeded','DemoOnly',CONVERT(DATETIME2(3),'2026-11-01T10:05:00')
 FROM dbo.UserSubscriptions s JOIN dbo.SubscriptionPlans p ON p.PlanId=s.PlanId
 WHERE s.UserId=N'demo-member-khaled' AND s.Status='Active' AND p.Price>0
 AND NOT EXISTS (SELECT 1 FROM dbo.Payments x WHERE x.SubscriptionId=s.SubscriptionId AND x.Provider='DemoOnly');

 -- Expert bookings (fixed timestamps make reruns deterministic).
 INSERT INTO dbo.ExpertBookings(ExpertUserId,LearnerUserId,ScheduledStartAt,ScheduledEndAt,AgreedPrice,Currency,Status,Notes)
 SELECT v.Expert,v.Learner,v.StartAt,DATEADD(MINUTE,60,v.StartAt),v.Price,'JOD',v.BookingStatus,N'Demo booking for UI preview only.'
 FROM (VALUES
 (N'demo-instructor-python',N'demo-member-sara',CONVERT(DATETIME2(3),'2026-11-10T14:00:00'),CAST(18.00 AS DECIMAL(10,2)),'Confirmed'),
 (N'demo-instructor-ux',N'demo-member-khaled',CONVERT(DATETIME2(3),'2026-11-11T15:00:00'),CAST(22.00 AS DECIMAL(10,2)),'PendingPayment')
 ) v(Expert,Learner,StartAt,Price,BookingStatus)
 WHERE NOT EXISTS (SELECT 1 FROM dbo.ExpertBookings b WHERE b.ExpertUserId=v.Expert AND b.LearnerUserId=v.Learner AND b.ScheduledStartAt=v.StartAt);

 -- Demo booking payment, marked succeeded only for confirmed booking.
 INSERT INTO dbo.Payments(ExpertBookingId,Amount,Currency,Status,Provider,PaidAt)
 SELECT b.ExpertBookingId,b.AgreedPrice,b.Currency,'Succeeded','DemoOnly',CONVERT(DATETIME2(3),'2026-11-03T09:00:00')
 FROM dbo.ExpertBookings b
 WHERE b.ExpertUserId=N'demo-instructor-python' AND b.LearnerUserId=N'demo-member-sara'
 AND b.ScheduledStartAt=CONVERT(DATETIME2(3),'2026-11-10T14:00:00')
 AND b.Status='Confirmed'
 AND NOT EXISTS (SELECT 1 FROM dbo.Payments p WHERE p.ExpertBookingId=b.ExpertBookingId AND p.Provider='DemoOnly');

 -- Review from a demo swap (the swap is not yet completed; use an illustrative
 -- booking review instead only when an actual completed booking exists).
 -- No review is fabricated for future sessions.

 -- Notifications; fixed titles and users prevent duplicates on rerun.
 INSERT INTO dbo.Notifications(UserId,Type,Title,Body,TargetUrl)
 SELECT v.UserId,v.NotificationType,v.Title,v.Body,NULL
 FROM (VALUES
 (N'demo-member-sara','ExpertBooking',N'Expert session confirmed',N'Your Python mentoring session is confirmed.'),
 (N'demo-member-khaled','Subscription',N'Subscription active',N'Your demo subscription is active.'),
 (N'demo-member-khaled','ExpertBooking',N'Booking awaiting payment',N'Your UI/UX booking is pending demo payment.')
 ) v(UserId,NotificationType,Title,Body)
 WHERE NOT EXISTS (SELECT 1 FROM dbo.Notifications n WHERE n.UserId=v.UserId AND n.Type=v.NotificationType AND n.Title=v.Title);

 -- Career enrollment and coherent milestone progress using the same path ID.
 DECLARE @PathId INT=(SELECT TOP (1) CareerPathId FROM dbo.CareerPaths WHERE Slug='full-stack-web-developer');
 IF @PathId IS NULL THROW 51303,'Full Stack Web Developer career path missing. Run 05.',1;
 INSERT INTO dbo.UserCareerPaths(UserId,CareerPathId,Status)
 SELECT N'demo-member-sara',@PathId,'InProgress'
 WHERE NOT EXISTS (SELECT 1 FROM dbo.UserCareerPaths WHERE UserId=N'demo-member-sara' AND CareerPathId=@PathId);
 INSERT INTO dbo.UserMilestoneProgress(EnrollmentId,MilestoneId,CareerPathId,Status)
 SELECT e.EnrollmentId,m.MilestoneId,e.CareerPathId,'NotStarted'
 FROM dbo.UserCareerPaths e JOIN dbo.CareerMilestones m ON m.CareerPathId=e.CareerPathId
 WHERE e.UserId=N'demo-member-sara' AND e.CareerPathId=@PathId
 AND NOT EXISTS (SELECT 1 FROM dbo.UserMilestoneProgress p WHERE p.EnrollmentId=e.EnrollmentId AND p.MilestoneId=m.MilestoneId);
 COMMIT TRANSACTION;
 SELECT 'ExpertProfiles' AS Entity,COUNT(*) AS Total FROM dbo.ExpertProfiles WHERE UserId IN (N'demo-instructor-python',N'demo-instructor-ux')
 UNION ALL SELECT 'ExpertBookings',COUNT(*) FROM dbo.ExpertBookings WHERE ExpertUserId IN (N'demo-instructor-python',N'demo-instructor-ux') AND LearnerUserId IN (N'demo-member-sara',N'demo-member-khaled')
 UNION ALL SELECT 'UserSubscriptions',COUNT(*) FROM dbo.UserSubscriptions WHERE UserId IN (N'demo-member-sara',N'demo-member-khaled')
 UNION ALL SELECT 'DemoPayments',COUNT(*) FROM dbo.Payments WHERE Provider='DemoOnly'
 UNION ALL SELECT 'Notifications',COUNT(*) FROM dbo.Notifications WHERE UserId IN (N'demo-member-sara',N'demo-member-khaled')
 UNION ALL SELECT 'CareerEnrollments',COUNT(*) FROM dbo.UserCareerPaths WHERE UserId=N'demo-member-sara'
 UNION ALL SELECT 'MilestoneProgress',COUNT(*) FROM dbo.UserMilestoneProgress p JOIN dbo.UserCareerPaths e ON e.EnrollmentId=p.EnrollmentId WHERE e.UserId=N'demo-member-sara';
 PRINT 'Experts, subscriptions, payments, notifications and career progress demo seeded successfully.';
END TRY
BEGIN CATCH
 IF @@TRANCOUNT>0 ROLLBACK TRANSACTION;
 THROW;
END CATCH;

GO


-- ===== 11: 11_SkillsSwapDB_RemainingDemoData =====
/* Skills Swap | 11 - Remaining meaningful demo data
   Run AFTER 01, 05, 06, 07, 08, 09, 10.
   Re-runnable for seeded demo identifiers; no passwords, fake file links or payment credentials.
   Existing demo users with NULL PasswordHash cannot sign in until provisioned through ASP.NET Core Identity.
*/
USE [SkillsSwapDB];
SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRY
 BEGIN TRANSACTION;
 IF NOT EXISTS (SELECT 1 FROM dbo.AspNetUsers WHERE Id=N'demo-member-sara')
    OR NOT EXISTS (SELECT 1 FROM dbo.AspNetUsers WHERE Id=N'demo-member-khaled')
    OR NOT EXISTS (SELECT 1 FROM dbo.Courses WHERE Title=N'Python Programming' AND Status='Published')
    THROW 51401, 'Required demo users/courses missing. Run seed scripts 05-10 first.', 1;

 -- 1. Application roles (do not add fake tokens/claims/logins).
 INSERT INTO dbo.AspNetRoles(Id,Name,NormalizedName,ConcurrencyStamp)
 SELECT v.Id,v.Name,UPPER(v.Name),CONVERT(NVARCHAR(36),NEWID())
 FROM (VALUES (N'demo-role-admin',N'Admin'),(N'demo-role-user',N'User'),(N'demo-role-expert',N'Expert')) v(Id,Name)
 WHERE NOT EXISTS (SELECT 1 FROM dbo.AspNetRoles r WHERE r.NormalizedName=UPPER(v.Name));
 IF EXISTS (SELECT 1 FROM (VALUES(N'Admin'),(N'User'),(N'Expert')) v(Name)
            WHERE NOT EXISTS (SELECT 1 FROM dbo.AspNetRoles r WHERE r.NormalizedName=UPPER(v.Name)))
    THROW 51402,'Required roles could not be resolved.',1;
 INSERT INTO dbo.AspNetUserRoles(UserId,RoleId)
 SELECT u.Id,r.Id FROM dbo.AspNetUsers u
 JOIN dbo.AspNetRoles r ON r.NormalizedName=N'USER'
 WHERE u.Id LIKE N'demo-%'
 AND NOT EXISTS (SELECT 1 FROM dbo.AspNetUserRoles ur WHERE ur.UserId=u.Id AND ur.RoleId=r.Id);
 INSERT INTO dbo.AspNetUserRoles(UserId,RoleId)
 SELECT u.Id,r.Id FROM dbo.AspNetUsers u
 JOIN dbo.AspNetRoles r ON r.NormalizedName=N'EXPERT'
 JOIN dbo.ExpertProfiles e ON e.UserId=u.Id
 WHERE u.Id LIKE N'demo-%'
 AND NOT EXISTS (SELECT 1 FROM dbo.AspNetUserRoles ur WHERE ur.UserId=u.Id AND ur.RoleId=r.Id);

 -- 2. Demo course enrollments; instructor/course FK and uniqueness are enforced by schema.
 DECLARE @Enroll TABLE(UserId NVARCHAR(450), CourseTitle NVARCHAR(200), InstructorId NVARCHAR(450));
 INSERT INTO @Enroll VALUES
 (N'demo-member-sara',N'Python Programming',N'demo-instructor-python'),
 (N'demo-member-sara',N'React Development',N'demo-instructor-react'),
 (N'demo-member-khaled',N'UI/UX Design',N'demo-instructor-ux'),
 (N'demo-member-noor',N'Graphic Design Masterclass',N'demo-instructor-design');
 IF EXISTS (SELECT 1 FROM @Enroll e LEFT JOIN dbo.Courses c ON c.Title=e.CourseTitle AND c.InstructorUserId=e.InstructorId WHERE c.CourseId IS NULL)
    THROW 51403,'Missing demo course for enrollment.',1;
 INSERT INTO dbo.CourseEnrollments(CourseId,UserId,Status)
 SELECT c.CourseId,e.UserId,'InProgress'
 FROM @Enroll e JOIN dbo.Courses c ON c.Title=e.CourseTitle AND c.InstructorUserId=e.InstructorId
 WHERE NOT EXISTS (SELECT 1 FROM dbo.CourseEnrollments ce WHERE ce.UserId=e.UserId AND ce.CourseId=c.CourseId);

 -- 3. First lesson completed, second in progress (both in same course as enrollment).
 INSERT INTO dbo.UserLessonProgress(EnrollmentId,LessonId,CourseId,Status,StartedAt,CompletedAt)
 SELECT ce.EnrollmentId,l.LessonId,ce.CourseId,
        CASE WHEN l.LessonOrder=1 THEN 'Completed' ELSE 'InProgress' END,
        CONVERT(DATETIME2(3),'2026-11-02T09:00:00'),
        CASE WHEN l.LessonOrder=1 THEN CONVERT(DATETIME2(3),'2026-11-02T10:00:00') ELSE NULL END
 FROM @Enroll e
 JOIN dbo.Courses c ON c.Title=e.CourseTitle AND c.InstructorUserId=e.InstructorId
 JOIN dbo.CourseEnrollments ce ON ce.CourseId=c.CourseId AND ce.UserId=e.UserId
 JOIN dbo.CourseLessons l ON l.CourseId=c.CourseId AND l.LessonOrder IN (1,2)
 WHERE NOT EXISTS (SELECT 1 FROM dbo.UserLessonProgress p WHERE p.EnrollmentId=ce.EnrollmentId AND p.LessonId=l.LessonId);

 -- 4. Preferences and availability: actual local weekly schedule, not live meeting links.
 INSERT INTO dbo.LearningPreferences(UserId,CurrentLevel,WeeklyHours,LearningStyle,CareerGoal)
 SELECT v.UserId,v.Lvl,v.Hours,v.Style,v.Goal
 FROM (VALUES
 (N'demo-member-sara','Beginner',6,'Visual',N'Become a full stack web developer'),
 (N'demo-member-khaled','Intermediate',4,'HandsOn',N'Improve software development skills'),
 (N'demo-member-noor','Intermediate',5,'ProjectBased',N'Build a design portfolio')
 ) v(UserId,Lvl,Hours,Style,Goal)
 WHERE NOT EXISTS (SELECT 1 FROM dbo.LearningPreferences p WHERE p.UserId=v.UserId);
 INSERT INTO dbo.UserAvailability(UserId,DayOfWeek,StartTime,EndTime,TimeZoneId)
 SELECT v.UserId,v.DayNum,CAST(v.StartAt AS TIME(0)),CAST(v.EndAt AS TIME(0)),N'Asia/Amman'
 FROM (VALUES
 (N'demo-member-sara',1,'17:00','19:00'),
 (N'demo-member-khaled',3,'18:00','20:00'),
 (N'demo-member-noor',5,'14:00','16:00'),
 (N'demo-instructor-python',2,'16:00','18:00')
 ) v(UserId,DayNum,StartAt,EndAt)
 WHERE NOT EXISTS (SELECT 1 FROM dbo.UserAvailability a WHERE a.UserId=v.UserId AND a.DayOfWeek=v.DayNum AND a.StartTime=CAST(v.StartAt AS TIME(0)) AND a.EndTime=CAST(v.EndAt AS TIME(0)));
 INSERT INTO dbo.NotificationPreferences(UserId)
 SELECT u.Id FROM dbo.AspNetUsers u
 WHERE u.Id LIKE N'demo-%' AND NOT EXISTS (SELECT 1 FROM dbo.NotificationPreferences n WHERE n.UserId=u.Id);

 -- 5. System settings for a demo deployment (not production secrets).
 INSERT INTO dbo.SystemSettings(SettingKey,SettingValue,SettingGroup)
 SELECT v.SettingKey,v.SettingValue,v.SettingGroup
 FROM (VALUES
 ('site.name',N'Skills Swap','General'),
 ('site.tagline',N'Knowledge is shared, not sold.','General'),
 ('site.demoMode',N'true','General'),
 ('learning.defaultTimeZone',N'Asia/Amman','Learning')
 ) v(SettingKey,SettingValue,SettingGroup)
 WHERE NOT EXISTS (SELECT 1 FROM dbo.SystemSettings s WHERE s.SettingKey=v.SettingKey);

 -- 6. Clearly labeled illustrative AI history. No real AI API call is implied.
 INSERT INTO dbo.AIConversations(UserId,Title)
 SELECT N'demo-member-sara',N'Demo: learning Python'
 WHERE NOT EXISTS (SELECT 1 FROM dbo.AIConversations a WHERE a.UserId=N'demo-member-sara' AND a.Title=N'Demo: learning Python');
 DECLARE @AiId INT=(SELECT TOP(1) AIConversationId FROM dbo.AIConversations WHERE UserId=N'demo-member-sara' AND Title=N'Demo: learning Python' ORDER BY AIConversationId);
 INSERT INTO dbo.AIMessages(AIConversationId,Role,Content)
 SELECT @AiId,v.Role,v.Content
 FROM (VALUES
 ('User',N'Demo question: Where should I start learning Python?'),
 ('Assistant',N'Demo response (not generated live): Start with variables, data types, and simple exercises.')
 ) v(Role,Content)
 WHERE NOT EXISTS (SELECT 1 FROM dbo.AIMessages m WHERE m.AIConversationId=@AiId AND m.Role=v.Role AND m.Content=v.Content);

 -- 7. A sample audit event, explicitly marked as seeded (not a real administrator action).
 INSERT INTO dbo.AuditLogs(ActorUserId,Action,EntityType,EntityId,Summary)
 SELECT NULL,N'DEMO_SEED',N'SystemSettings',N'site.demoMode',N'Sample audit record created by demo seed script; not a real user action.'
 WHERE NOT EXISTS (SELECT 1 FROM dbo.AuditLogs a WHERE a.Action=N'DEMO_SEED' AND a.EntityType=N'SystemSettings' AND a.EntityId=N'site.demoMode');

 COMMIT TRANSACTION;
 SELECT 'AspNetRoles' AS Entity,COUNT(*) AS Total FROM dbo.AspNetRoles
 UNION ALL SELECT 'AspNetUserRoles',COUNT(*) FROM dbo.AspNetUserRoles
 UNION ALL SELECT 'CourseEnrollments',COUNT(*) FROM dbo.CourseEnrollments
 UNION ALL SELECT 'UserLessonProgress',COUNT(*) FROM dbo.UserLessonProgress
 UNION ALL SELECT 'LearningPreferences',COUNT(*) FROM dbo.LearningPreferences
 UNION ALL SELECT 'UserAvailability',COUNT(*) FROM dbo.UserAvailability
 UNION ALL SELECT 'NotificationPreferences',COUNT(*) FROM dbo.NotificationPreferences
 UNION ALL SELECT 'SystemSettings',COUNT(*) FROM dbo.SystemSettings
 UNION ALL SELECT 'AIConversations',COUNT(*) FROM dbo.AIConversations
 UNION ALL SELECT 'AIMessages',COUNT(*) FROM dbo.AIMessages
 UNION ALL SELECT 'AuditLogs',COUNT(*) FROM dbo.AuditLogs;
 PRINT 'SkillsSwapDB remaining demo data seeded successfully.';
END TRY
BEGIN CATCH
 IF @@TRANCOUNT>0 ROLLBACK TRANSACTION;
 THROW;
END CATCH;

GO


-- ===== 12: 12_SkillsSwapDB_Reviews =====
/* Skills Swap — historical DEMO exchange and reviews.
   Run after scripts 01, 05, 06, 07, 08, 09, 10, 11.
   Safe to rerun: uses a stable marker and checks review uniqueness.
   All events are fictional demonstration records, not real sessions. */
USE [SkillsSwapDB];
SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @Sender NVARCHAR(450) = N'demo-member-sara';
    DECLARE @Receiver NVARCHAR(450) = N'demo-member-khaled';
    DECLARE @Marker NVARCHAR(2000) = N'[DEMO-HISTORICAL-REVIEW-01] Completed UI/UX and Python skill exchange for presentation.';
    DECLARE @OfferedSkillId INT;
    DECLARE @RequestedSkillId INT;
    DECLARE @SwapId INT;

    SELECT @OfferedSkillId = us.UserSkillId
    FROM dbo.UserSkills AS us
    INNER JOIN dbo.Skills AS s ON s.SkillId = us.SkillId
    WHERE us.UserId = @Sender AND us.Intent = 'Teach' AND s.Slug = 'ui-ux-design';

    SELECT @RequestedSkillId = us.UserSkillId
    FROM dbo.UserSkills AS us
    INNER JOIN dbo.Skills AS s ON s.SkillId = us.SkillId
    WHERE us.UserId = @Receiver AND us.Intent = 'Teach' AND s.Slug = 'python-programming';

    IF @OfferedSkillId IS NULL OR @RequestedSkillId IS NULL
        THROW 51401, 'Required demo teaching skills are missing. Run script 09 first.', 1;

    SELECT @SwapId = sr.SwapRequestId
    FROM dbo.SwapRequests AS sr WITH (UPDLOCK, HOLDLOCK)
    WHERE sr.SenderUserId = @Sender
      AND sr.ReceiverUserId = @Receiver
      AND sr.Message = @Marker;

    IF @SwapId IS NULL
    BEGIN
        INSERT INTO dbo.SwapRequests
            (SenderUserId, ReceiverUserId, OfferedUserSkillId, RequestedUserSkillId,
             Status, Message, CreatedAt, RespondedAt)
        VALUES
            (@Sender, @Receiver, @OfferedSkillId, @RequestedSkillId,
             'Completed', @Marker, '2026-10-01T10:00:00', '2026-10-02T10:00:00');
        SET @SwapId = CONVERT(INT, SCOPE_IDENTITY());
    END;

    IF NOT EXISTS (
        SELECT 1 FROM dbo.Meetings
        WHERE SwapRequestId = @SwapId AND Status = 'Completed'
    )
    BEGIN
        INSERT INTO dbo.Meetings (SwapRequestId, StartAt, EndAt, Status, Provider)
        VALUES (@SwapId, '2026-10-10T14:00:00', '2026-10-10T15:00:00', 'Completed', 'DemoOnly');
    END;

    IF NOT EXISTS (
        SELECT 1 FROM dbo.SwapRequestEvents
        WHERE SwapRequestId = @SwapId AND NewStatus = 'Completed'
    )
    BEGIN
        INSERT INTO dbo.SwapRequestEvents
            (SwapRequestId, ActorUserId, OldStatus, NewStatus)
        VALUES (@SwapId, @Sender, 'InProgress', 'Completed');
    END;

    INSERT INTO dbo.Reviews
        (ReviewerUserId, ReviewedUserId, SwapRequestId, Rating, Comment, CreatedAt)
    SELECT @Sender, @Receiver, @SwapId, 5,
           N'Great Python explanations and a clear, helpful learning session. (Demo review)',
           '2026-10-11T10:00:00'
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.Reviews
        WHERE SwapRequestId = @SwapId AND ReviewerUserId = @Sender
    );

    INSERT INTO dbo.Reviews
        (ReviewerUserId, ReviewedUserId, SwapRequestId, Rating, Comment, CreatedAt)
    SELECT @Receiver, @Sender, @SwapId, 5,
           N'Excellent UI/UX guidance and useful practical feedback. (Demo review)',
           '2026-10-11T11:00:00'
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.Reviews
        WHERE SwapRequestId = @SwapId AND ReviewerUserId = @Receiver
    );

    COMMIT TRANSACTION;

    SELECT sr.SwapRequestId, sr.Status, p1.FullName AS Reviewer,
           p2.FullName AS ReviewedUser, r.Rating, r.Comment
    FROM dbo.Reviews AS r
    INNER JOIN dbo.SwapRequests AS sr ON sr.SwapRequestId = r.SwapRequestId
    INNER JOIN dbo.UserProfiles AS p1 ON p1.UserId = r.ReviewerUserId
    INNER JOIN dbo.UserProfiles AS p2 ON p2.UserId = r.ReviewedUserId
    WHERE sr.Message = @Marker
    ORDER BY r.ReviewId;

    SELECT 'Reviews' AS Entity, COUNT(*) AS Total FROM dbo.Reviews
    UNION ALL
    SELECT 'Historical demo swaps', COUNT(*) FROM dbo.SwapRequests WHERE Message = @Marker;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

GO


-- ===== FINAL VERIFICATION =====
/* Read-only verification, run after 01 and 02. No demo accounts or fake data. */
USE [SkillsSwapDB];
SET NOCOUNT ON;
DECLARE @TableCount INT = (SELECT COUNT(*) FROM sys.tables WHERE schema_id = SCHEMA_ID('dbo'));
SELECT @TableCount AS ActualTableCount, 46 AS ExpectedTableCount,
       CASE WHEN @TableCount = 46 THEN 'PASS' ELSE 'FAIL' END AS TableCountResult;
IF @TableCount <> 46 THROW 51001, 'Expected 46 dbo tables.', 1;
SELECT t.name AS TableName FROM sys.tables AS t WHERE t.schema_id = SCHEMA_ID('dbo') ORDER BY t.name;
SELECT COUNT(*) AS ForeignKeyCount FROM sys.foreign_keys WHERE schema_id = SCHEMA_ID('dbo');
SELECT COUNT(*) AS CheckConstraintCount FROM sys.check_constraints WHERE schema_id = SCHEMA_ID('dbo');
SELECT COUNT(*) AS ViewCount FROM sys.views WHERE schema_id = SCHEMA_ID('dbo');
SELECT COUNT(*) AS StoredProcedureCount FROM sys.procedures WHERE schema_id = SCHEMA_ID('dbo');
SELECT COUNT(*) AS TriggerCount FROM sys.triggers WHERE parent_class = 1 AND is_ms_shipped = 0;
SELECT name AS UntrustedForeignKey FROM sys.foreign_keys WHERE is_not_trusted = 1;
SELECT name AS UntrustedCheck FROM sys.check_constraints WHERE is_not_trusted = 1;
EXEC dbo.sp_GetDashboardCounts;
EXEC dbo.sp_SearchSkills;
PRINT N'Verification completed; inspect counts and empty untrusted-constraint result sets.';

GO
