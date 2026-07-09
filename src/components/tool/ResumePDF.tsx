import React from "react";
import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ResumeData, ResumeTemplateId } from "@/lib/resume";

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGkyAZ9hiA.woff2", fontWeight: 700 },
    { src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2", fontWeight: 900 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 38,
    backgroundColor: "#ffffff",
    fontFamily: "Inter",
    color: "#111827",
  },
  pageExecutive: {
    backgroundColor: "#fbfaf7",
  },
  pageCreative: {
    backgroundColor: "#fffafb",
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 5,
  },
  header: {
    marginBottom: 18,
    borderBottomWidth: 1.5,
    borderBottomColor: "#eef2f7",
    paddingBottom: 18,
  },
  modernHeader: {
    backgroundColor: "#f8fafc",
    borderRadius: 18,
    padding: 22,
    marginBottom: 18,
  },
  executiveHeader: {
    backgroundColor: "#10131a",
    borderRadius: 18,
    padding: 24,
    marginBottom: 18,
  },
  creativeHeader: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 18,
  },
  classicHeader: {
    borderBottomWidth: 2,
    borderBottomColor: "#111827",
    paddingBottom: 16,
    marginBottom: 18,
    alignItems: "center",
  },
  headerTopline: {
    fontSize: 7,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 3,
    marginBottom: 8,
  },
  name: {
    fontSize: 27,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 1.8,
    marginBottom: 7,
  },
  headerNameLarge: {
    fontSize: 31,
    lineHeight: 1.05,
  },
  nameLight: {
    color: "#ffffff",
  },
  roleLabel: {
    fontSize: 8,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 2.2,
    marginTop: 4,
    marginBottom: 12,
  },
  monogram: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  monogramInline: {
    marginBottom: 0,
    marginRight: 16,
  },
  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 12,
    marginBottom: 12,
    objectFit: "cover",
  },
  avatarImageInline: {
    marginBottom: 0,
    marginRight: 16,
  },
  avatarClassic: {
    borderRadius: 21,
    alignSelf: "center",
  },
  monogramText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 900,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  contactItem: {
    fontSize: 8.5,
    color: "#64748b",
  },
  contactLight: {
    color: "#e5e7eb",
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 2.4,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  sectionTitleClassic: {
    borderBottomColor: "#d4d4d8",
    color: "#111827",
  },
  sectionTitleExecutive: {
    color: "#9a762d",
  },
  summary: {
    fontSize: 9.5,
    lineHeight: 1.55,
    color: "#334155",
  },
  entry: {
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 2,
  },
  entryTitle: {
    flex: 1,
    fontSize: 10.5,
    fontWeight: 800,
    color: "#111827",
  },
  entrySubtitle: {
    fontSize: 9.2,
    color: "#475569",
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 8.2,
    color: "#94a3b8",
  },
  bulletPoint: {
    flexDirection: "row",
    marginBottom: 2.5,
    paddingLeft: 4,
  },
  bullet: {
    width: 10,
    fontSize: 8.8,
    color: "#64748b",
  },
  bulletText: {
    flex: 1,
    fontSize: 8.8,
    lineHeight: 1.48,
    color: "#475569",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  skillBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    fontSize: 7.5,
    fontWeight: 800,
    color: "#334155",
    textTransform: "uppercase",
  },
  skillBadgeExecutive: {
    backgroundColor: "#10131a",
    color: "#ffffff",
    borderRadius: 12,
  },
  skillBadgeCreative: {
    color: "#ffffff",
    borderRadius: 12,
  },
});

interface ResumePDFProps {
  data: ResumeData;
  accentColor: string;
  template: ResumeTemplateId;
}

function formatBullets(text: string) {
  if (!text) return null;

  return text.split("\n").map((line, index) => {
    const cleanLine = line.replace(/^\s*(?:[-*]|\d+\.)\s*/, "").trim();
    if (!cleanLine) return null;

    return (
      <View key={`${cleanLine}-${index}`} style={styles.bulletPoint}>
        <Text style={styles.bullet}>{"-"}</Text>
        <Text style={styles.bulletText}>{cleanLine}</Text>
      </View>
    );
  });
}

export default function ResumePDF({ data, accentColor, template }: ResumePDFProps) {
  const title = data.personalInfo.fullName || "Resume";
  const isClassic = template === "classic";
  const isExecutive = template === "executive";
  const isCreative = template === "creative";
  const role = data.experience[0]?.role || "Professional Resume";
  const profileImage = data.personalInfo.profileImage;
  const initials = title
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const pageStyle = [
    styles.page,
    ...(isExecutive ? [styles.pageExecutive] : []),
    ...(isCreative ? [styles.pageCreative] : []),
  ];
  const sectionTitleStyle = [
    styles.sectionTitle,
    ...(isClassic ? [styles.sectionTitleClassic] : []),
    ...(isExecutive ? [styles.sectionTitleExecutive] : []),
    ...(!isClassic && !isExecutive ? [{ color: accentColor }] : []),
  ];
  const skillStyle = [
    styles.skillBadge,
    ...(isExecutive ? [styles.skillBadgeExecutive] : []),
    ...(isCreative ? [styles.skillBadgeCreative, { backgroundColor: accentColor }] : []),
  ];

  return (
    <Document title={`${title} - Exismic Resume`}>
      <Page size="A4" style={pageStyle}>
        <View style={[styles.accentBar, { backgroundColor: isClassic ? "#111827" : accentColor }]} />

        {isExecutive ? (
          <View style={styles.executiveHeader}>
            <Text style={[styles.headerTopline, { color: "#d7b56d" }]}>Executive Profile</Text>
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              {profileImage ? (
                <Image src={profileImage} style={[styles.avatarImage, styles.avatarImageInline]} alt="Profile" />
              ) : (
                <View style={[styles.monogram, styles.monogramInline, { backgroundColor: "#d7b56d" }]}>
                  <Text style={styles.monogramText}>{initials || "CV"}</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, styles.headerNameLarge, styles.nameLight]}>{title}</Text>
                <Text style={[styles.roleLabel, { color: "#d7b56d" }]}>{role}</Text>
              </View>
            </View>
            <View style={styles.contactRow}>
              {data.personalInfo.email && <Text style={[styles.contactItem, styles.contactLight]}>{data.personalInfo.email}</Text>}
              {data.personalInfo.phone && <Text style={[styles.contactItem, styles.contactLight]}>{data.personalInfo.phone}</Text>}
              {data.personalInfo.location && <Text style={[styles.contactItem, styles.contactLight]}>{data.personalInfo.location}</Text>}
              {data.personalInfo.website && <Text style={[styles.contactItem, styles.contactLight]}>{data.personalInfo.website}</Text>}
            </View>
          </View>
        ) : isCreative ? (
          <View style={[styles.creativeHeader, { backgroundColor: accentColor }]}>
            {profileImage ? (
              <Image src={profileImage} style={styles.avatarImage} alt="Profile" />
            ) : (
              <View style={[styles.monogram, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
                <Text style={styles.monogramText}>{initials || "CV"}</Text>
              </View>
            )}
            <Text style={[styles.headerTopline, { color: "#ffffff" }]}>Portfolio Resume</Text>
            <Text style={[styles.name, styles.headerNameLarge, styles.nameLight]}>{title}</Text>
            <Text style={[styles.roleLabel, { color: "#ffffff" }]}>{role}</Text>
            <View style={styles.contactRow}>
              {data.personalInfo.email && <Text style={[styles.contactItem, styles.contactLight]}>{data.personalInfo.email}</Text>}
              {data.personalInfo.phone && <Text style={[styles.contactItem, styles.contactLight]}>{data.personalInfo.phone}</Text>}
              {data.personalInfo.location && <Text style={[styles.contactItem, styles.contactLight]}>{data.personalInfo.location}</Text>}
              {data.personalInfo.website && <Text style={[styles.contactItem, styles.contactLight]}>{data.personalInfo.website}</Text>}
            </View>
          </View>
        ) : isClassic ? (
          <View style={styles.classicHeader}>
            {profileImage && <Image src={profileImage} style={[styles.avatarImage, styles.avatarClassic]} alt="Profile" />}
            <Text style={[styles.name, { color: "#111827" }]}>{title}</Text>
            <Text style={[styles.roleLabel, { color: "#52525b" }]}>{role}</Text>
            <View style={styles.contactRow}>
              {data.personalInfo.email && <Text style={styles.contactItem}>{data.personalInfo.email}</Text>}
              {data.personalInfo.phone && <Text style={styles.contactItem}>{data.personalInfo.phone}</Text>}
              {data.personalInfo.location && <Text style={styles.contactItem}>{data.personalInfo.location}</Text>}
              {data.personalInfo.website && <Text style={styles.contactItem}>{data.personalInfo.website}</Text>}
            </View>
          </View>
        ) : (
          <View style={styles.modernHeader}>
            {profileImage ? (
              <Image src={profileImage} style={styles.avatarImage} alt="Profile" />
            ) : (
              <View style={[styles.monogram, { backgroundColor: accentColor }]}>
                <Text style={styles.monogramText}>{initials || "CV"}</Text>
              </View>
            )}
            <Text style={[styles.headerTopline, { color: "#94a3b8" }]}>Professional Resume</Text>
            <Text style={[styles.name, styles.headerNameLarge, { color: accentColor }]}>{title}</Text>
            <Text style={[styles.roleLabel, { color: "#64748b" }]}>{role}</Text>
            <View style={styles.contactRow}>
              {data.personalInfo.email && <Text style={styles.contactItem}>{data.personalInfo.email}</Text>}
              {data.personalInfo.phone && <Text style={styles.contactItem}>{data.personalInfo.phone}</Text>}
              {data.personalInfo.location && <Text style={styles.contactItem}>{data.personalInfo.location}</Text>}
              {data.personalInfo.website && <Text style={styles.contactItem}>{data.personalInfo.website}</Text>}
            </View>
          </View>
        )}

        {data.personalInfo.summary && (
          <View style={styles.section}>
            <Text style={sectionTitleStyle}>Professional Profile</Text>
            <Text style={styles.summary}>{data.personalInfo.summary}</Text>
          </View>
        )}

        {data.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={sectionTitleStyle}>Experience</Text>
            {data.experience.map((exp) => (
              <View key={exp.id} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{exp.company || "Company"}</Text>
                  <Text style={styles.entryDate}>{exp.period}</Text>
                </View>
                <Text style={styles.entrySubtitle}>{exp.role || "Role"}</Text>
                {exp.description && <View>{formatBullets(exp.description)}</View>}
              </View>
            ))}
          </View>
        )}

        {data.education.length > 0 && (
          <View style={styles.section}>
            <Text style={sectionTitleStyle}>Education</Text>
            {data.education.map((edu) => (
              <View key={edu.id} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{edu.school || "School"}</Text>
                  <Text style={styles.entryDate}>{edu.period}</Text>
                </View>
                <Text style={styles.entrySubtitle}>{edu.degree || "Degree"}</Text>
              </View>
            ))}
          </View>
        )}

        {data.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={sectionTitleStyle}>Projects</Text>
            {data.projects.map((project) => (
              <View key={project.id} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{project.name || "Project"}</Text>
                  {project.link && <Text style={styles.entryDate}>{project.link}</Text>}
                </View>
                {project.role && <Text style={styles.entrySubtitle}>{project.role}</Text>}
                {project.description && <View>{formatBullets(project.description)}</View>}
              </View>
            ))}
          </View>
        )}

        {data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={sectionTitleStyle}>Core Competencies</Text>
            <View style={styles.skillsContainer}>
              {data.skills.map((skill) => (
                <Text key={skill} style={skillStyle}>{skill}</Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
