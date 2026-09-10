BEGIN;

CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_name TEXT;
  preview TEXT;
BEGIN

  IF TG_OP = 'INSERT'
     AND NEW.receiver_id IS NOT NULL
     AND NEW.receiver_id <> NEW.sender_id
  THEN

    SELECT full_name
    INTO sender_name
    FROM public.profiles
    WHERE id = NEW.sender_id;

    preview :=
      LEFT(
        REGEXP_REPLACE(
          COALESCE(
            NEW.content,
            ''
          ),
          '[[:space:]]+',
          ' ',
          'g'
        ),
        120
      );

    PERFORM public.create_notification(
      NEW.receiver_id,
      'message',
      'New message from ' ||
        COALESCE(
          sender_name,
          'Someone'
        ),
      preview,

      /*
       * CRITICAL:
       * related_id MUST be conversation_id.
       */
      NEW.conversation_id,

      /*
       * related_user_id = sender.
       */
      NEW.sender_id
    );

  END IF;

  RETURN NEW;

END;
$$;


DROP TRIGGER IF EXISTS
  trg_notify_new_message
ON public.messages;


CREATE TRIGGER
  trg_notify_new_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION
  public.handle_new_message_notification();


COMMIT;