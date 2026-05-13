# Alerts System Documentation

## Overview

An alerts system has been implemented in the Supabase backend to allow temperature sensors to automatically generate alerts whenever a measurement exceeds a configured threshold.

The system is sensor-based, meaning each sensor can have its own minimum and maximum thresholds.

Example:

* Bathroom sensor

  * Minimum threshold: 20°C
  * Maximum threshold: 30°C

* Living room sensor

  * Minimum threshold: 18°C
  * Maximum threshold: 26°C

This allows different rooms and use cases to have different alert conditions.

---

# Changes Made

## 1. Sensor Table Updates

The `sensor` table was expanded to support activation, ownership tracking, and threshold-based alerts.

### Added columns

| Column          | Type        | Purpose                                               |
| --------------- | ----------- | ----------------------------------------------------- |
| activation_code | varchar     | Unique activation code used when registering a sensor |
| is_active       | boolean     | Indicates whether the sensor has been activated       |
| activated_at    | timestamptz | Timestamp of activation                               |
| activated_by    | uuid        | User who activated the sensor                         |
| min_threshold   | float8      | Minimum allowed temperature                           |
| max_threshold   | float8      | Maximum allowed temperature                           |
| alerts_enabled  | boolean     | Enables/disables alerts for the sensor                |

---

## 2. Activation Code Generation Function

A PostgreSQL function was created to automatically generate activation codes.

### Purpose

The function automatically creates a random 8-character code containing:

* Uppercase letters
* Numbers

Example:

```text
A7F3K9P2
```

### Why this was implemented

This allows sensors to be physically shipped to a customer and later activated inside the application without manually configuring the sensor beforehand.

The user enters the activation code in the dashboard and assigns the sensor to a location.

---

## 3. Sensor Activation Flow

The following activation flow was implemented:

```text
User logs in
↓
User selects a location
↓
User enters sensor activation code
↓
System finds inactive sensor
↓
Sensor is assigned to location
↓
Sensor becomes active
```

When activated:

* `location_id` is assigned
* `is_active` becomes `true`
* `activated_at` is set
* `activated_by` stores the user ID

---

## 4. Alerts Table Created

A new `alerts` table was created.

### Purpose

The table stores automatically generated alerts whenever a sensor exceeds its configured thresholds.

### Table Structure

| Column          | Type        | Purpose                                            |
| --------------- | ----------- | -------------------------------------------------- |
| id              | uuid        | Primary key                                        |
| sensor_id       | uuid        | Sensor that generated the alert                    |
| temperature_id  | uuid        | Temperature measurement that triggered the alert   |
| value           | float8      | Temperature value                                  |
| threshold       | float8      | Threshold that was exceeded                        |
| type            | varchar     | Alert type (`above_max` or `below_min`)            |
| message         | text        | Human-readable alert message                       |
| created_at      | timestamptz | Timestamp of alert creation                        |
| email_sent      | boolean     | Tracks whether an email notification has been sent |

---

# Trigger System

## Temperature Alert Trigger Function

A PostgreSQL trigger function named:

```sql
create_temperature_alert()
```

was created.

### Purpose

The function automatically checks every newly inserted temperature measurement.

### Flow

```text
Arduino inserts temperature row
↓
Trigger runs automatically
↓
Sensor thresholds are loaded
↓
Temperature is validated
↓
Alert row is inserted if threshold exceeded
```

---

## Trigger Conditions

### Below Minimum Threshold

If:

```text
temperature < min_threshold
```

An alert is created with:

```text
Type: below_min
```

---

### Above Maximum Threshold

If:

```text
temperature > max_threshold
```

An alert is created with:

```text
Type: above_max
```

---

## Trigger Registration

A database trigger was registered:

```sql
CREATE TRIGGER temperature_alert_trigger
AFTER INSERT ON temperature
FOR EACH ROW
EXECUTE FUNCTION create_temperature_alert();
```

### What this does

Every time Arduino inserts a new temperature row into the `temperature` table, the trigger automatically runs.

This means alert generation is handled entirely inside the database.

No frontend logic is required.

---

# Row Level Security (RLS)

## Alerts Table RLS

RLS was enabled on the `alerts` table.

```sql
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
```

---

## SELECT Policy

A SELECT policy was added so users can only see alerts from sensors belonging to locations they have access to.

### Policy Logic

The user can only read alerts if:

```text
alert.sensor_id
→ belongs to sensor
→ sensor belongs to location
→ location exists in user_location
→ user_id matches auth.uid()
```

### Result

Users can only view alerts from their own household/location.

---

# Sensor Table RLS

Additional RLS policies were added to support sensor activation.

---

## Activation Code Lookup Policy

Authenticated users can search for inactive sensors using activation codes.

### Purpose

Without this policy, users would not be able to find a sensor before it belongs to one of their locations.

---

## Sensor Activation Update Policy

Users can activate sensors only if:

* The sensor is inactive
* The sensor has no location assigned
* The target location belongs to the authenticated user

### Result

This prevents users from stealing or reassigning already activated sensors.

---

# Temperature Table Changes

The Arduino integration was updated so each temperature measurement now includes:

```json
{
  "sensor_id": "sensor-uuid",
  "value": 23.4
}
```

### Why this was necessary

Without a `sensor_id`, the system would not know:

* Which sensor created the measurement
* Which location the measurement belongs to
* Which thresholds should be used
* Which users should be allowed to see the data

---

# Overall System Architecture

The complete flow now works like this:

```text
Arduino
↓
Supabase temperature table
↓
Database trigger executes
↓
Threshold validation occurs
↓
Alert inserted into alerts table
↓
Frontend reads alerts via RLS-protected queries
```

---

# Future Improvements

The system is prepared for future expansion.

Possible future features:

* Email notifications
* Push notifications
* SMS alerts
* Multiple sensor types
* Machine learning anomaly detection
* Escalation system for critical alerts
* Alert history dashboard
* Per-user notification preferences

---

# Summary

The implemented system now supports:

* Multi-user households
* Multi-location support
* Sensor activation via activation code
* Per-sensor thresholds
* Automatic alert generation
* Secure Row Level Security policies
* Sensor ownership tracking
* Database-driven automation via triggers

The architecture is scalable and supports adding additional sensors and locations in the future without major database changes.
