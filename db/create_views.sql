USE TES_PROJECTS_DEV;

CREATE OR REPLACE
    ALGORITHM = UNDEFINED
    DEFINER = `eefbeli205`@`%`
    SQL SECURITY DEFINER
VIEW `TES_PROJECTS_DEV`.`PROJECT_VIEW` AS
    SELECT
        `P`.`ID` AS `PROJECT_ID`,
        `P`.`NAME` AS `PROJECT_NAME`,
        (CASE
            WHEN (MAX((`M`.`STATUS` + 0)) = 1) THEN 'Completed'
            WHEN (MAX((`M`.`STATUS` + 0)) = 2) THEN 'On Track'
            WHEN (MAX((`M`.`STATUS` + 0)) = 3) THEN 'At Risk'
            WHEN (MAX((`M`.`STATUS` + 0)) = 4) THEN 'Blocked'
            ELSE 'UNKNOWN'
        END) AS `STATUS`,
        `P`.`GOAL` AS `GOAL`,
        `P`.`DESCRIPTION` AS `DESCRIPTION`,
        `P`.`HIGHLIGHTS` AS `HIGHLIGHTS`,
        `P`.`RISKS` AS `RISKS/DEPENDENCIES`,
        `P`.`PRODUCT_OWNER` AS `PRODUCT_OWNER`,
        COUNT(`M`.`ID`) AS `MILESTONE_COUNT`,
        MIN(`M`.`START_DATE`) AS `START_DATE`,
        MAX(`M`.`END_DATE`) AS `END_DATE`,
        `P`.`NOTE` AS `NOTE`
    FROM
        (`TES_PROJECTS_DEV`.`PROJECT` `P`
        LEFT JOIN `TES_PROJECTS_DEV`.`MILESTONE` `M` ON ((`P`.`ID` = `M`.`PROJECT_ID`)))
    WHERE
        ((`P`.`ARCHIVED` = 0)
            AND (`M`.`ARCHIVED` = 0))
    GROUP BY `P`.`ID`

CREATE OR REPLACE
    ALGORITHM = UNDEFINED
    DEFINER = `eefbeli205`@`%`
    SQL SECURITY DEFINER
VIEW `TES_PROJECTS_DEV`.`MILESTONE_VIEW` AS
    SELECT
        `P`.`ID` AS `PROJECT_ID`,
        `P`.`NAME` AS `PROJECT_NAME`,
        `P`.`GOAL` AS `GOAL`,
        `M`.`ID` AS `MILESTONE_ID`,
        `M`.`MILESTONE` AS `MILESTONE`,
        `M`.`STATUS` AS `STATUS`,
        `M`.`START_DATE` AS `START_DATE`,
        `M`.`END_DATE` AS `END_DATE`,
        `M`.`COMPLETION_DATE` AS `COMPLETION_DATE`,
        `M`.`CURRENT_STATUS` AS `CURRENT_STATUS`,
        `M`.`DELIVERABLE` AS `GOALS_DELIVERABLES`,
        `M`.`NEXT_STEPS` AS `NEXT_STEPS`,
        `M`.`RESOURCES` AS `RESOURCES`,
        `M`.`PERCENT_COMPLETE` AS `PERCENT_COMPLETE`
    FROM
        (`TES_PROJECTS_DEV`.`MILESTONE` `M`
        LEFT JOIN `TES_PROJECTS_DEV`.`PROJECT` `P` ON ((`M`.`PROJECT_ID` = `P`.`ID`)))
    WHERE
        (`P`.`ARCHIVED` = 0)
