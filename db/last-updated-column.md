1.  Add a `last_updated` column to your table "AddonSettings":

```
sqlCopy codeALTER TABLE "AddonSettings"
ADD COLUMN last_updated TIMESTAMP WITH TIME ZONE;

```

2.  Create a trigger function to update the `last_updated` column:

```
sqlCopy codeCREATE OR REPLACE FUNCTION update_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

```

3.  Create a trigger to call the function when a record is updated:

```sql
Copy codeCREATE TRIGGER "AddonSettings_last_updated_trigger"
BEFORE UPDATE ON "AddonSettings"
FOR EACH ROW
EXECUTE FUNCTION update_last_updated();

```

```sql
CREATE TRIGGER "AddonSettings_last_updated_insert_trigger"
BEFORE INSERT ON "AddonSettings"
FOR EACH ROW
EXECUTE FUNCTION update_last_updated();

```

Now, whenever a record in the "AddonSettings" table is updated, the `last_updated` column will automatically be set to the current timestamp.
