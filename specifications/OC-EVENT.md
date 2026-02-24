# OC-EVENT 0.0.1: Automotive Event Data Schema

**Standard Identifier:** OC-EVENT-2026-01  
**Authority:** OpenCar.dev Working Group  
**Release Date:** February 2026

---

## Foreword

The OpenCar Foundation is a global consortium of automotive platform owners, developers, and industry stakeholders. The mission of OpenCar is to provide open, non-proprietary data standards that foster interoperability between automotive apps, websites, and hardware.

## Introduction

As the automotive aftermarket and enthusiast communities move toward a digital-first ecosystem, the lack of a unified "Event Language" has led to data silos. OC-EVENT 1.0 provides a universal syntax for describing any automotive gathering—from grassroots "Takeovers" to high-level "Corporate Drives"—ensuring that a user can discover, join, and navigate to an event regardless of the platform they use.

---

## 1. Scope

This standard defines the mandatory and optional data fields required to represent an automotive event. It specifically addresses the unique requirements of vehicle-based gatherings, including terrain types, venue constraints, and driving dynamics.

## 2. Normative References

- **ISO 8601:** Representation of dates/times.
- **RFC 7946:** The GeoJSON Format.
- **Schema.org/Event:** General event vocabulary (extended by OC-EVENT).

## 3. Terms and Definitions

### 3.1 On-Road

Activities occurring on paved surfaces (Asphalt, Concrete) intended for standard street-legal vehicles.

### 3.2 Off-Road

Activities occurring on unpaved surfaces (Dirt, Sand, Rock) requiring specific vehicle capabilities (Ground Clearance, 4WD).

### 3.3 Takeover

A high-mobility, often unpermitted automotive gathering requiring rapid dissemination of location data and "Next Spot" updates.

---

## 4. The OC-EVENT Schema Structure

### 4.1 Header Logic

Every OC-EVENT compliant file MUST begin with the versioning header to ensure backward compatibility.

| Field          | Type   | Description                     |
| :------------- | :----- | :------------------------------ |
| `oc_namespace` | String | Must be "OC-EVENT"              |
| `oc_version`   | String | Current version (e.g., "1.0.0") |

### 4.2 Environment & Terrain (The "Auto" Specialization)

Unlike standard event formats (like iCal), OC-EVENT requires environmental context to prevent vehicle damage or legal trespass.

- **`surface_grading`**: [1-5] (1: Smooth Pavement, 5: Extreme Rock Crawling)
- **`venue_access`**: [Public, Gated, Membership_Required]
- **`commercial_status`**: [Business_Premise, Public_Land, Private_Track]

### 4.3 Technical Implementation (JSON)

```json
{
  "oc_header": {
    "namespace": "OC-EVENT",
    "version": "0.0.1"
  },
  "event_details": {
    "title": "East Side Off-Road Challenge",
    "type": "TrailRun",
    "environment": {
      "surface": "off-road",
      "terrain": "sand",
      "difficulty": 3
    },
    "logistics": {
      "meeting_point": {
        "type": "Point",
        "coordinates": [-115.1728, 36.1147]
      },
      "start_time": "2026-04-12T08:00:00Z"
    }
  }
}
```
