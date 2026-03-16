"""
Phase 10 — Access Control Simulation
======================================
Simulates Role-Based Access Control (RBAC) for the HL7 pipeline,
demonstrating how different user roles (Data Processor, Auditor,
Admin, Data Principal) have varying levels of access.

Compliance reference
--------------------
- IT Act 2000 §43: Penalty for unauthorised access — RBAC prevents
  this by enforcing least-privilege access.
- DPDP Act 2023 §8(5): Data fiduciaries must implement appropriate
  organisational measures — RBAC is an organisational control.
- GDPR Art. 25: Data protection by design — access controls must be
  built into the system architecture.
- IS/ISO 27001 A.9: Access control policy requires role definition
  and access rights documentation.

PEP 8 compliant.
"""

import logging
from dataclasses import dataclass, asdict
from typing import List, Dict, Any

logger = logging.getLogger("hl7_pipeline.access_control")


@dataclass
class Permission:
    """A single access permission."""
    resource: str
    action: str       # read, write, execute, delete
    granted: bool
    justification: str


@dataclass
class Role:
    """An access control role with associated permissions."""
    id: str
    name: str
    description: str
    legal_basis: str
    permissions: List[Permission]
    risk_level: str   # LOW, MEDIUM, HIGH


class AccessControlSimulator:
    """
    Simulate RBAC for the pipeline, demonstrating proper access
    segregation as required by IT Act §43 and DPDP §8(5).

    Methods
    -------
    get_roles()              → list of all roles with permissions
    check_access(role, res)  → bool indicating if access is granted
    get_access_matrix()      → full matrix of roles × resources
    """

    def __init__(self) -> None:
        self._roles = self._define_roles()
        logger.info("[AccessControl] Initialized  roles=%d  [IT Act §43]",
                     len(self._roles))

    @staticmethod
    def _define_roles() -> List[Role]:
        return [
            Role(
                id="data_processor",
                name="Data Processor",
                description="Operates the pipeline to transform clinical data into HL7 messages. Has access to execute the pipeline and view processed output but cannot access raw PII or modify system configuration.",
                legal_basis="DPDP §2(12): 'Data Processor' processes personal data on behalf of the fiduciary",
                risk_level="MEDIUM",
                permissions=[
                    Permission("pipeline_execute", "execute", True, "Core job function — must be able to run transformations"),
                    Permission("output_files", "read", True, "Needs to verify anonymised HL7 output"),
                    Permission("output_files", "write", False, "Output modification prohibited — integrity seal would break"),
                    Permission("raw_data", "read", False, "PII access not required for processing — DPDP §8(4) data minimisation"),
                    Permission("audit_log", "read", True, "Can view own processing history"),
                    Permission("audit_log", "write", False, "Cannot modify audit records — IT Act §67C"),
                    Permission("system_config", "write", False, "Configuration changes restricted to Admin"),
                    Permission("breach_scan", "execute", False, "Breach detection restricted to Auditor/Admin"),
                    Permission("encryption_comparison", "read", True, "Can view encryption benchmarks"),
                    Permission("compliance_score", "read", True, "Can view compliance status"),
                ],
            ),
            Role(
                id="auditor",
                name="Compliance Auditor",
                description="Reviews compliance status, audit trails, and breach detection results. Has read-only access to all compliance-related resources but cannot execute the pipeline or modify data.",
                legal_basis="DPDP §28: Data Protection Board may appoint auditors; IT Act §69: Government can direct monitoring",
                risk_level="LOW",
                permissions=[
                    Permission("pipeline_execute", "execute", False, "Auditors observe, not operate"),
                    Permission("output_files", "read", True, "Must verify anonymisation quality"),
                    Permission("output_files", "write", False, "Read-only access for integrity"),
                    Permission("raw_data", "read", False, "PII not needed for compliance auditing"),
                    Permission("audit_log", "read", True, "Primary function — review processing trail"),
                    Permission("audit_log", "write", False, "Cannot modify audit records"),
                    Permission("system_config", "read", True, "Can review but not modify configuration"),
                    Permission("breach_scan", "execute", True, "Can trigger breach detection scans"),
                    Permission("encryption_comparison", "read", True, "Can review cryptographic controls"),
                    Permission("compliance_score", "read", True, "Primary function — assess compliance"),
                    Permission("risk_assessment", "read", True, "Can review risk matrix"),
                    Permission("data_lineage", "read", True, "Can trace data provenance"),
                ],
            ),
            Role(
                id="admin",
                name="System Administrator",
                description="Full administrative access to configure the pipeline, manage encryption keys, and perform system maintenance. The most privileged role with corresponding accountability.",
                legal_basis="IT Act §43A: Must implement reasonable security practices; DPDP §8(5): Appropriate organisational measures",
                risk_level="HIGH",
                permissions=[
                    Permission("pipeline_execute", "execute", True, "Full operational control"),
                    Permission("output_files", "read", True, "Full access"),
                    Permission("output_files", "write", True, "Can regenerate or delete output"),
                    Permission("output_files", "delete", True, "Can fulfil erasure requests — DPDP §12(3)"),
                    Permission("raw_data", "read", True, "Emergency access for troubleshooting"),
                    Permission("audit_log", "read", True, "Full compliance review"),
                    Permission("audit_log", "write", False, "Even admins cannot modify audit log — separation of duties"),
                    Permission("system_config", "write", True, "Can modify pipeline configuration"),
                    Permission("breach_scan", "execute", True, "Can trigger and review scans"),
                    Permission("encryption_comparison", "read", True, "Can review cryptographic controls"),
                    Permission("compliance_score", "read", True, "Can view compliance status"),
                    Permission("risk_assessment", "read", True, "Can review risk assessment"),
                    Permission("data_lineage", "read", True, "Can trace data provenance"),
                ],
            ),
            Role(
                id="data_principal",
                name="Data Principal (Patient)",
                description="The individual whose personal data is being processed. Has rights to access their own data, request corrections, and withdraw consent as guaranteed by DPDP Act.",
                legal_basis="DPDP §11–§14: Rights of data principal (access, correction, erasure, grievance)",
                risk_level="LOW",
                permissions=[
                    Permission("pipeline_execute", "execute", False, "Patients do not operate the pipeline"),
                    Permission("output_files", "read", True, "Right to access own data — DPDP §11"),
                    Permission("output_files", "write", False, "Cannot modify system output"),
                    Permission("raw_data", "read", False, "Raw data access not applicable — only anonymised output provided"),
                    Permission("audit_log", "read", False, "Patient-specific log extract only (via fiduciary)"),
                    Permission("consent_withdrawal", "execute", True, "Right to withdraw consent — DPDP §6(6)"),
                    Permission("data_correction", "execute", True, "Right to correction — DPDP §12(1)"),
                    Permission("data_erasure", "execute", True, "Right to erasure — DPDP §12(3)"),
                    Permission("grievance_filing", "execute", True, "Right to grievance redressal — DPDP §13"),
                ],
            ),
        ]

    def get_roles(self) -> Dict[str, Any]:
        """Return all roles with their permissions."""
        return {
            "roles": [
                {
                    **{k: v for k, v in asdict(r).items() if k != "permissions"},
                    "permissions": [asdict(p) for p in r.permissions],
                    "total_permissions": len(r.permissions),
                    "granted_count": sum(1 for p in r.permissions if p.granted),
                    "denied_count": sum(1 for p in r.permissions if not p.granted),
                }
                for r in self._roles
            ],
            "total_roles": len(self._roles),
            "resources": list(set(
                p.resource for r in self._roles for p in r.permissions
            )),
        }

    def get_access_matrix(self) -> Dict[str, Any]:
        """Return a matrix of roles × resources."""
        resources = sorted(set(
            p.resource for r in self._roles for p in r.permissions
        ))

        matrix = {}
        for role in self._roles:
            row: Dict[str, Dict] = {}
            for res in resources:
                perms = [p for p in role.permissions if p.resource == res]
                row[res] = {
                    p.action: p.granted for p in perms
                }
            matrix[role.id] = {
                "name": role.name,
                "access": row,
            }

        return {
            "resources": resources,
            "matrix": matrix,
        }

    def check_access(self, role_id: str, resource: str, action: str = "read") -> Dict[str, Any]:
        """Check if a role has a specific access permission."""
        role = next((r for r in self._roles if r.id == role_id), None)
        if not role:
            return {"granted": False, "reason": "Role not found"}

        perm = next(
            (p for p in role.permissions if p.resource == resource and p.action == action),
            None,
        )

        if perm is None:
            return {
                "granted": False,
                "reason": f"No permission defined for {resource}:{action}",
                "role": role.name,
            }

        return {
            "granted": perm.granted,
            "reason": perm.justification,
            "role": role.name,
            "resource": resource,
            "action": action,
        }
