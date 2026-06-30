SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_type = 'BASE TABLE' AND table_schema NOT IN ('pg_catalog','information_schema')
ORDER BY table_schema, table_name;

CREATE INDEX IF NOT EXISTS idx_res_active_user
    ON "Reservations" ("userId")
    WHERE status = 'Active';


CREATE OR REPLACE FUNCTION trg_check_active_res_limit()
    RETURNS TRIGGER AS
$$
DECLARE
    _limit CONSTANT INTEGER := 5;
    _active_cnt INTEGER;
BEGIN
    IF NEW.status = 'Active' THEN
        SELECT COUNT(*) INTO _active_cnt
        FROM "Reservations"
        WHERE "userId" = NEW."userId"
          AND status   = 'Active'
          AND id <> COALESCE(OLD.id, -1);

        IF _active_cnt >= _limit THEN
            RAISE EXCEPTION
                USING MESSAGE = format(
                        'Лимит активных броней (%s) для пользователя %s исчерпан',
                        _limit, NEW."userId"
                                ),
                    ERRCODE = 'check_violation';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reservations_limit ON "Reservations";
CREATE TRIGGER trg_reservations_limit
    BEFORE INSERT OR UPDATE OF status ON "Reservations"
    FOR EACH ROW
EXECUTE FUNCTION trg_check_active_res_limit();

CREATE UNIQUE INDEX IF NOT EXISTS uq_ticket_active
    ON "Reservations" ("ticketId")
    WHERE status = 'Active';

DROP TRIGGER IF EXISTS trg_reservations_limit ON "Reservations";
DROP FUNCTION IF EXISTS trg_check_active_res_limit();
DROP INDEX IF EXISTS uq_ticket_active;
DROP INDEX IF EXISTS idx_res_active_user;
