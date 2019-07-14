DROP TABLE IF EXISTS USERS;

CREATE TABLE USERS(
	NETID VARCHAR(20) PRIMARY KEY,
	NAME VARCHAR(255) NOT NULL UNIQUE,
	EMAIL VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO USERS (NETID,NAME,EMAIL) VALUES ('jbrege200','Justin T Bregenzer','justin_bregenzer@cable.comcast.com');
INSERT INTO USERS (NETID,NAME,EMAIL) VALUES ('kramai00','Karen Ramaika','karen_ramaika@cable.comcast.com');
INSERT INTO USERS (NETID,NAME,EMAIL) VALUES ('nbalog725','Nicholas Balog','nicholas_balog@comcast.com');
INSERT INTO USERS (NETID,NAME,EMAIL) VALUES ('hfame200','Hany Fame','Hany_fame@cable.comcast.com');
INSERT INTO USERS (NETID,NAME,EMAIL) VALUES ('pniiva457','Papa Nii Vanderpuye','papa_niivanderpuye@comcast.com');
