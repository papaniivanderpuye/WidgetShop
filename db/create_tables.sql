CREATE DATABASE IF NOT EXISTS `WIDGET_SHOP`;
USE `WIDGET_SHOP`;
DROP TABLE IF EXISTS `WIDGET_ORDER`;

CREATE TABLE `WIDGET_ORDER` (
    `ID` VARCHAR (36) NOT NULL,
    `TYPE` enum('Widget','Widget Pro','Widget Xtreme') NOT NULL,
    `COLOR` enum('red','blue','yellow') NOT NULL,
    `QUANTITY` int(11) DEFAULT NULL,
    `DATE_NEEDED_BY` date DEFAULT NULL,
    PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;