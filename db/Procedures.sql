DROP PROCEDURE IF EXISTS CREATE_WIDGET_ORDER;

DELIMITER //
CREATE PROCEDURE CREATE_WIDGET_ORDER
  (
    INOUT P_RETURN_CODE INT,
    INOUT P_MESSAGE VARCHAR(255),
    IN P_ID VARCHAR(20),
    IN P_TYPE VARCHAR(50),
    IN P_COLOR VARCHAR(50),
    IN P_QUANTITY INT,
    IN P_DATE_NEEDED_BY DATE
  )

BEGIN
	SET P_RETURN_CODE = 0;
	SET P_MESSAGE = NULL;

    IF(P_TYPE IS NULL OR P_TYPE NOT IN('Widget', 'Widget Pro','Widget Xtreme')) THEN
		SET P_MESSAGE = '[ERROR] TYPE IS NOT VALID (Must be either Widget, Widget Pro or Widget Xtreme)';
		SET P_RETURN_CODE = 4002;
	END IF;
    IF(P_COLOR IS NULL OR P_COLOR NOT IN('red', 'blue', 'yellow')) THEN
		SET P_MESSAGE = '[ERROR] COLOR IS NOT VALID (Must be either red, blue or yellow)';
		SET P_RETURN_CODE = 4003;
	END IF;
    IF ( (P_QUANTITY IS NULL) OR (P_QUANTITY<1) ) THEN
		SET P_MESSAGE = '[ERROR] QUANTITY NOT VALID (Must be greater than 0)';
		SET P_RETURN_CODE = 4001;
	END IF;

	IF P_RETURN_CODE = 0 THEN
        SET P_ID = UUID();
		INSERT INTO WIDGET_ORDER
			(
                ID,
                TYPE,
                COLOR,
                QUANTITY,
                DATE_NEEDED_BY
			)
		VALUES
			(
                P_ID,
                P_TYPE,
                P_COLOR,
                P_QUANTITY,
                P_DATE_NEEDED_BY
			);
		SET P_MESSAGE = P_ID;
	END IF;
END //
