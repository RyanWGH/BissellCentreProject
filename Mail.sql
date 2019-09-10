USE [BisselCentre]
GO

/****** Object:  Table [dbo].[Mail]    Script Date: 2019-09-10 12:04:23 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Mail](
	[MID] [int] IDENTITY(1,1) NOT NULL,
	[PID] [int] NOT NULL,
	[SenderName] [varchar](255) NOT NULL,
	[Date] [date] NOT NULL,
	[Status] [int] NOT NULL,
	[Signature] [varchar](255) NULL,
	[PickUpDate] [date] NULL,
	[SendBackDate] [date] NULL,
	[UserReceive] [int] NULL,
	[UserPickUp] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[MID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[Mail]  WITH CHECK ADD FOREIGN KEY([PID])
REFERENCES [dbo].[Participant] ([PID])
GO

ALTER TABLE [dbo].[Mail]  WITH CHECK ADD FOREIGN KEY([UserPickUp])
REFERENCES [dbo].[Users] ([UID])
GO

ALTER TABLE [dbo].[Mail]  WITH CHECK ADD FOREIGN KEY([UserReceive])
REFERENCES [dbo].[Users] ([UID])
GO

