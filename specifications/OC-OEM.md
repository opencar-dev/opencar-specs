# OC-OEM 0.0.1: OEM Vehicle Identity Schema

**Standard Identifier:** OC-OEM-2026-01  
**Authority:** OpenCar.dev Working Group  
**Release Date:** July 2026

---

## Foreword

The OpenCar Foundation is a global consortium of automotive platform owners, developers, and industry stakeholders. The mission of OpenCar is to provide open, non-proprietary data standards that foster interoperability between automotive apps, websites, and hardware.

## Introduction

Automotive platforms routinely need a shared way to name a vehicle as it left the factory. Without a common identity format, year/make/model/trim values diverge across silos—blocking fitment lookups, event vehicle lists, marketplace listings, and cross-app discovery. OC-OEM 0.0.1 defines a minimal, universal syntax for OEM vehicle identity.

---

## 1. Scope

This standard defines the mandatory data fields required to represent an OEM vehicle identity by year, make, model, and trim name. It does not define engine codes, option packages, VIN decoding, or aftermarket configuration.

## 2. Normative References

- **ISO 8601:** Representation of dates/times (year values).
- **Schema.org/Vehicle:** General vehicle vocabulary (extended by OC-OEM).

## 3. Terms and Definitions

### 3.1 OEM

Original Equipment Manufacturer — the factory brand and configuration as sold new, prior to aftermarket modification.

### 3.2 Make

The manufacturer or marque name (e.g., Toyota, Ford, Porsche).

### 3.3 Model

The vehicle line name within a make (e.g., Camry, F-150, 911).

### 3.4 Trim

The marketed trim or grade name that distinguishes variants within a model year (e.g., SE, XLT, Carrera S).

---

## 4. The OC-OEM Schema Structure

### 4.1 Header Logic

Every OC-OEM compliant file MUST begin with the versioning header to ensure backward compatibility.

| Field          | Type   | Description                     |
| :------------- | :----- | :------------------------------ |
| `oc_namespace` | String | Must be "OC-OEM"                |
| `oc_version`   | String | Current version (e.g., "0.0.1") |

### 4.2 Vehicle Identity

| Field  | Type    | Required | Description                                      |
| :----- | :------ | :------- | :----------------------------------------------- |
| `year` | Integer | Yes      | Model year (four-digit Gregorian year)           |
| `make` | String  | Yes      | Manufacturer / marque name                       |
| `model`| String  | Yes      | Vehicle line name                                |
| `trim` | String  | Yes      | Trim / grade name as marketed by the OEM         |

### 4.3 Technical Implementation (JSON)

```json
{
  "oc_header": {
    "namespace": "OC-OEM",
    "version": "0.0.1"
  },
  "vehicle": {
    "year": 2024,
    "make": "Toyota",
    "model": "Tacoma",
    "trim": "TRD Off-Road"
  }
}
```
