const th = {

    campus : "ชื่อสถาบันอุดมศึกษา",
    faculty: "สำนักวิชา",
    department: "สาขาวิชา",
    academicYear:"ปีการศึกษา",
    semester:"ภาคการศึกษา",
    course:"เลือกรายวิชา",


    button: {
        setting:"ตั้งค่า",
        create :"สร้าง",
    },

    description : "รายละเอียด",
    common: {
        loading: "กำลังโหลด",
        lastUpdated: "อัปเดตล่าสุด",
        description: "รายละเอียด",
        app: {
            dashboardSystem: "ระบบแดชบอร์ด"
        },
        dialog: {
            error: "ข้อผิดพลาด"
        },
        language: {
            badge: "ภาษา: {lang}"
        },
        sections: {
            content: "เนื้อหา",
            settings: "การตั้งค่า"
        },
        actions: {
            add: "เพิ่ม",
            apply: "ใช้งานตัวกรอง",
            cancel: "ยกเลิก",
            edit: "แก้ไข",
            exportCsv: "ส่งออก CSV",
            notNow: "ไว้ภายหลัง",
            open: "เปิด",
            remove: "ลบ",
            save: "บันทึก",
            update: "อัปเดต"
        },
        status: {
            label: "สถานะ",
            active: "ใช้งาน",
            inactive: "ไม่ใช้งาน"
        },
        audit: {
            at: "เวลา",
            by: "โดย",
            created: "สร้างเมื่อ",
            updated: "แก้ไขเมื่อ"
        }
    },
    ivts: {
        dashboard: "Dashboard",
        dashboardSubtitle: "ระบบติดตามยานพาหนะผ่านกล้อง CCTV",
        vehicles: "ทะเบียนรถ",
        cameras: "จัดการกล้อง",
        userManagement: "จัดการสิทธิ์ผู้ใช้",
        reports: "รายงาน",
        searchByPlateOrOwner: "ค้นหาทะเบียนรถหรือเจ้าของ",
        cameraLocations: "ตำแหน่งกล้องบนแผนที่",
        cameraActive: "กล้องปกติ (Active)",
        cameraInactive: "ขัดข้อง (Inactive)",
        alerts: "การแจ้งเตือน",
        allSources: "ทุกแหล่งที่มา",
        systemSource: "ระบบอัตโนมัติ",
        humanSource: "แจ้งจากบุคคล",
        allSeverities: "ทุกระดับความรุนแรง",
        highSeverity: "ระดับสูง",
        mediumSeverity: "ระดับกลาง",
        lowSeverity: "ระดับต่ำ",
        emergencyReport: "รายงานเหตุฉุกเฉิน",
        humanGuest: "บุคคล (guest)",
        humanStaff: "บุคคล (staff)",
        cameraOffline: "กล้องออฟไลน์",
        noSignalFor: "ไม่มีสัญญาณมา {min} นาที",
        unregisteredVehicle: "พบรถไม่มีทะเบียนในระบบ",
        summary: "สถิติสรุป",
        totalCameras: "กล้องทั้งหมด",
        vehiclesToday: "รถวันนี้",
        comparedToYesterday: "เทียบเมื่อวาน",
        hourlyTraffic: "รถรายชั่วโมง",
        topLocationsToday: "Top locations วันนี้",
        unitCars: "คัน",
        addCamera: "เพิ่มกล้อง",
        editSave: "แก้ไข / บันทึก",
        deleteCamera: "ลบกล้อง",
        searchCameras: "ค้นหากล้อง",
        id: "รหัส",
        location: "ตำแหน่ง",
        status: "สถานะ",
        timeRange: {
            today: "วันนี้",
            thisWeek: "สัปดาห์นี้",
            custom: "กำหนดเอง"
        },
        owner: "เจ้าของ",
        modelColor: "รุ่น / สี",
        pathStatus: "สถานะเส้นทาง",
        detectionTimeline: "ไทม์ไลน์การตรวจจับ",
        cannotLoadDoc: "ไม่สามารถโหลดรูปเอกสารได้",
        ownerName: "ชื่อเจ้าของ",
        accountStatus: "สถานะบัญชี",
        rejectReason: "เหตุผลการปฏิเสธ",
        rejectReasonPlaceholder: "กรุณาระบุเหตุผลการปฏิเสธ",
        confirmReject: "ยืนยัน Reject",
        docStatus: "สถานะเอกสาร",
        searchPlateUser: "ค้นหาด้วยทะเบียนรถหรือชื่อผู้ใช้",
        filterAll: "ทั้งหมด",
        filterPending: "รอตรวจสอบ",
        filterApproved: "อนุมัติแล้ว",
        filterRejected: "ถูกปฏิเสธ",
        confirmDeleteVehicle: "ยืนยันการลบรถ",
        confirmDeleteVehicleText: "คุณแน่ใจหรือไม่ว่าต้องการลบรถทะเบียน {plate}? การกระทำนี้ไม่สามารถย้อนกลับได้",
        toast: {
            loadVehicleFailed: "ไม่สามารถโหลดข้อมูลรถได้",
            approveSuccess: "อนุมัติเรียบร้อย",
            approveFailed: "อนุมัติไม่สำเร็จ",
            deleteSuccess: "ลบรถเรียบร้อย",
            deleteFailed: "ลบรถไม่สำเร็จ",
            approveDocSuccess: "อนุมัติเอกสารเรียบร้อย",
            approveDocFailed: "อนุมัติเอกสารไม่สำเร็จ",
            rejectDocSuccess: "ปฏิเสธเอกสารเรียบร้อย",
            rejectDocFailed: "ปฏิเสธเอกสารไม่สำเร็จ",
            exportSuccess: "ส่งออกข้อมูลเรียบร้อย",
            exportFailed: "ส่งออกข้อมูลไม่สำเร็จ"
        }
    },
    auth: {
        errors: {
            title: "เกิดข้อผิดพลาดในการยืนยันตัวตน"
        },
        signIn: {
            contactTitle: "1 ติดต่อสอบถาม",
            contactText: "หากพบปัญหาการใช้งานบริการดังกล่าว กรุณาติดต่อทีมงานที่จุดบริการ One Stop Service อาคารบริการวิชาการ (AS) ชั้น 4",
            contactPhone: "โทร 0-5391-6411, 6053",
            socialTitle: "เข้าสู่ระบบด้วยบัญชีสังคมออนไลน์",
            errors: {
                google: "การเข้าสู่ระบบด้วย Google ล้มเหลว กรุณาลองใหม่อีกครั้ง"
            }
        },
        loginPage: {
            subtitle: "เข้าสู่ระบบด้วยบัญชีของคุณ",
            username: "ชื่อผู้ใช้",
            password: "รหัสผ่าน",
            login: "เข้าสู่ระบบ",
            signUp: "สมัครใช้งาน",
            signUpText: "สร้างบัญชีใหม่เพื่อเริ่มใช้งานบริการต่าง ๆ ของแพลตฟอร์ม",
            registerNow: "สมัครตอนนี้"
        },
        twoFa: {
            title: "ยืนยันตัวตนบัญชีของคุณ",
            subtitle: "การปกป้องบัญชีของคุณเป็นสิ่งสำคัญที่สุดสำหรับเรา",
            instruction: "กรุณายืนยันบัญชีของคุณโดยกรอกรหัสที่ส่งไปยัง:",
            email: "อีเมล",
            receiveHint: "อาจใช้เวลาสักครู่ในการรับรหัส",
            resendPrompt: "ยังไม่ได้รับรหัสใช่หรือไม่?",
            resendAction: "ส่งรหัสใหม่อีกครั้ง",
            errors: {
                resend: "ไม่สามารถส่งรหัสยืนยันใหม่ได้ กรุณาลองอีกครั้ง",
                verify: "รหัสยืนยันไม่ถูกต้องหรือหมดอายุ กรุณาขอรหัสใหม่แล้วลองอีกครั้ง"
            }
        },
        trustDevice: {
            title: "เชื่อถืออุปกรณ์นี้หรือไม่?",
            subtitle: "ลดขั้นตอนการยืนยันเพิ่มเติมบนเบราว์เซอร์นี้",
            ifTrusted: "หากเชื่อถือ",
            ifTrustedText: "จะข้าม 2FA เป็นเวลา 30 วันถัดไป",
            condition: "เงื่อนไข",
            conditionText: "ต้องเป็นอุปกรณ์เดิมและเครือข่ายเดิม",
            tip: "คำแนะนำ",
            tipText: "ควรใช้กับอุปกรณ์ส่วนตัวของคุณเท่านั้น",
            confirm: "เชื่อถืออุปกรณ์นี้"
        }
    },
    nav: {
        dashboard: "Dashboard",
        cctvViewer: "จัดการกล้อง",
        ivtsRegistry: "ทะเบียน IVTS",
        vehicleManagement: "ทะเบียนรถ",
        userManagement: "จัดการสิทธิ์ผู้ใช้",
        reports: "รายงาน",
        businessOperations: "งานปฏิบัติการ IVTS",
        emergencyReportManagement: "จัดการรายงานเหตุฉุกเฉิน",
        banks: "ธนาคาร",
        template: "ต้นแบบ",
        accessControl: "การควบคุมสิทธิ์",
        config: "ตั้งค่าเริ่มต้น",
        messageAuthen: "ข้อความยืนยันตัวตน",
        emailNotifications: "การแจ้งเตือนอีเมล",
        workflowActions: "Workflow Actions",
        runtimeAccess: "สิทธิ์การเข้าถึงขณะรันระบบ",
        databaseBackup: "สำรองฐานข้อมูล",
        settingMessage: "ตั้งค่าข้อความ",
        settingVerification: "ตั้งค่าการยืนยัน",
        setting: "การตั้งค่า",
        settingGroup: "จัดการกลุ่ม",
        messageStatus: "สถานะข้อความ",
        accounts: "บัญชีผู้ใช้",
        accountDirectory: "สารบบบัญชี",
        identityLifecycle: "วงจรตัวตน",
        training: "การอบรม",
        trainingRequests: "คำขออบรม",
        trainingRecords: "ประวัติการอบรม",
        permission: "สิทธิ์การใช้งาน",
        theme: "ธีม",
        colors: "สี",
        typography: "ตัวอักษร",
        components: "คอมโพเนนต์",
        base: "พื้นฐาน",
        breadcrumbs: "Breadcrumbs",
        cards: "Cards",
        carousels: "Carousels",
        collapses: "Collapses",
        jumbotrons: "Jumbotrons",
        listGroups: "List Groups",
        navs: "Navs",
        navbars: "Navbars",
        paginations: "Paginations",
        popovers: "Popovers",
        progressBars: "Progress Bars",
        switches: "Switches",
        tabs: "Tabs",
        tooltips: "Tooltips",
        buttons: "ปุ่ม",
        standardButtons: "ปุ่มมาตรฐาน",
        buttonDropdowns: "ปุ่มดรอปดาวน์",
        buttonGroups: "กลุ่มปุ่ม",
        brandButtons: "ปุ่มแบรนด์",
        charts: "กราฟ",
        editors: "ตัวแก้ไข",
        codeEditors: "ตัวแก้ไขโค้ด",
        textEditors: "ตัวแก้ไขข้อความ",
        forms: "ฟอร์ม",
        basicForms: "ฟอร์มพื้นฐาน",
        advancedForms: "ฟอร์มขั้นสูง",
        validationForms: "ฟอร์มตรวจสอบข้อมูล",
        googleMaps: "Google Maps",
        icons: "ไอคอน",
        coreUiIcons: "CoreUI Icons",
        brands: "แบรนด์",
        flags: "ธง",
        notifications: "การแจ้งเตือน",
        alerts: "Alerts",
        badges: "Badges",
        modals: "Modals",
        toaster: "Toaster",
        plugins: "ปลั๊กอิน",
        draggable: "Draggable",
        calendar: "Calendar",
        spinners: "Spinners",
        tables: "ตาราง",
        basicTables: "ตารางพื้นฐาน",
        advancedTables: "ตารางขั้นสูง",
        widgets: "วิดเจ็ต",
        extras: "เพิ่มเติม",
        pages: "หน้า",
        login: "เข้าสู่ระบบ",
        register: "สมัครใช้งาน",
        error404: "ข้อผิดพลาด 404",
        error500: "ข้อผิดพลาด 500",
        apps: "แอป",
        invoicing: "ใบแจ้งหนี้",
        invoice: "ใบแจ้งหนี้",
        email: "อีเมล",
        inbox: "กล่องจดหมาย",
        message: "ข้อความ",
        compose: "เขียน",
        labels: "ป้ายกำกับ",
        labelDanger: "ป้ายสีแดง",
        labelInfo: "ป้ายข้อมูล",
        labelWarning: "ป้ายเตือน",
        projectShortcuts: "ทางลัดโครงการ",
        projectSettings: "การตั้งค่า",
        general: "ทั่วไป",
        new: "ใหม่",
        pro: "PRO"
    },
    ivtsDashboard: {
        kicker: "งานปฏิบัติการ IVTS",
        title: "ศูนย์กลางจัดการ IVTS",
        subtitle: "จัดการข้อตกลง หน่วยงานเจ้าของ สถานะการตรวจ และรอบต่ออายุ โดยให้สิทธิ์การใช้งานทำงานผ่าน IAM",
        scopeTitle: "ขอบเขตการใช้งาน",
        scopeHeading: "โมดูลที่เปิดใช้งาน",
        actions: {
            openRegistry: "เปิดทะเบียน IVTS"
        },
        scopeItems: {
            signIn: "Google sign-in สำหรับผู้ใช้ IVTS",
            delegatedPermission: "หน้าจอจัดการสิทธิ์ที่ส่งคำสั่งไป IAM",
            accountDirectory: "สารบบบัญชีที่ดึงสิทธิ์และข้อมูลจาก IAM",
            ivtsRegistry: "ทะเบียน IVTS การตรวจ การรายงาน และการต่ออายุ"
        },
        cards: {
            identity: {
                label: "แหล่งข้อมูลตัวตน",
                value: "IAM",
                hint: "IVTS ไม่เก็บ identity master ซ้ำ"
            },
            apiFlow: {
                label: "รูปแบบ API",
                value: "Client Credentials",
                hint: "ใช้สำหรับการเชื่อม IVTS ไป IAM แบบ delegated"
            },
            owner: {
                label: "เจ้าของ business",
                value: "IVTS",
                hint: "ระบบนี้เก็บเฉพาะข้อมูลข้อตกลงและ workflow"
            }
        }
    },
    accounts: {
        directory: {
            title: "สารบบบัญชี",
            subtitle: "ตรวจสอบข้อมูลบัญชีและสิทธิ์ที่มาจาก IAM โดยไม่เก็บ identity master ซ้ำใน IVTS",
            table: {
                subtitle: "ค้นหาและตรวจสอบข้อมูลบัญชีที่ delegated มาจาก IAM",
                searchPlaceholder: "ค้นหาบัญชี",
                resultSummary: "แสดง {start}-{end} จาก {total} บัญชี"
            },
            actions: {
                edit: "แก้ไข",
                access: "สิทธิ์",
                remove: "ลบ",
                invite: "เชิญ"
            },
            modes: {
                viewUsers: "ดูผู้ใช้",
                manageUsers: "จัดการผู้ใช้",
                userContacts: "ข้อมูลติดต่อผู้ใช้"
            },
            stats: {
                total: {
                    label: "บัญชีทั้งหมด",
                    hint: "ข้อมูลบัญชีที่ตอบกลับจาก IAM"
                },
                active: {
                    label: "ใช้งานอยู่",
                    hint: "พร้อมสำหรับการเข้าใช้และรับสิทธิ์"
                },
                attention: {
                    label: "ต้องติดตาม",
                    hint: "อยู่ในสถานะรอดำเนินการ ล็อก หรือพักการใช้งาน"
                }
            },
            messages: {
                loadError: "ไม่สามารถโหลดรายการบัญชีได้",
                loadSecurityWorkspaceError: "ไม่สามารถโหลดพื้นที่ตรวจสอบสิทธิ์ของบัญชีได้",
                updateSuccess: "อัปเดตสิทธิ์การเข้าถึงของบัญชีแล้ว",
                updateError: "ไม่สามารถอัปเดตสิทธิ์การเข้าถึงของบัญชีได้",
                removeConfirmTitle: "ลบ",
                removeConfirmMessage: "ลบ {account} ออกจาก IVTS หรือไม่?",
                removeSuccess: "ลบบัญชีออกจาก IVTS แล้ว",
                removeError: "ไม่สามารถลบบัญชีออกจาก IVTS ได้",
                revokeSessionSuccess: "ยกเลิก session แล้ว",
                revokeSessionError: "ไม่สามารถยกเลิก session ได้",
                revokeTrustedDeviceSuccess: "ยกเลิก trusted device แล้ว",
                revokeTrustedDeviceError: "ไม่สามารถยกเลิก trusted device ได้",
                inviteTitle: "เชิญเข้า IVTS",
                inviteSubtitle: "เชิญบัญชีและกำหนดสิทธิ์เข้า IVTS",
                inviteSuccess: "เชิญบัญชีสำเร็จ",
                inviteError: "ไม่สามารถเชิญบัญชีเข้า IVTS ได้"
            },
            invite: {
                email: "อีเมล",
                firstName: "ชื่อ",
                lastName: "นามสกุล",
                groups: "กลุ่ม IVTS",
                groupPlaceholder: "เลือกกลุ่ม IVTS อย่างน้อยหนึ่งกลุ่ม",
                groupRequired: "กรุณาเลือกกลุ่ม IVTS อย่างน้อยหนึ่งกลุ่ม"
            }
        },
        users: {
            title: "User Management",
            subtitle: "ตรวจสอบข้อมูลผู้ใช้ภายใน MongoDB ของระบบ",
            table: {
                subtitle: "ค้นหาและตรวจสอบผู้ใช้ภายในระบบ",
                searchPlaceholder: "ค้นหาผู้ใช้",
                fullName: "ชื่อ-สกุล",
                email: "อีเมล",
                role: "บทบาท",
                createdAt: "สร้างเมื่อ"
            },
            stats: {
                total: {
                    label: "ผู้ใช้ทั้งหมด",
                    hint: "รายการผู้ใช้ภายในที่เก็บใน MongoDB"
                }
            },
            messages: {
                loadError: "ไม่สามารถโหลดผู้ใช้ได้",
                noUsers: "ไม่พบผู้ใช้",
                pageSummary: "แสดง {start}-{end} จาก {total} ผู้ใช้"
            }
        },
        permissions: {
            title: "สิทธิ์ที่มีผลจริง",
            subtitle: "ตรวจสอบกลุ่มที่ได้รับมอบหมายและตารางสิทธิ์สุดท้ายที่ delegated มาจาก IAM",
            summary: {
                assignedGroups: "กลุ่มที่ได้รับมอบหมาย",
                permissionRows: "จำนวนแถวสิทธิ์"
            },
            sections: {
                assignedGroups: "กลุ่มที่ได้รับมอบหมาย",
                effectivePermissions: "สิทธิ์ที่มีผลจริง"
            },
            scope: "ขอบเขต",
            empty: {
                assignedGroups: "ไม่พบกลุ่มที่ได้รับมอบหมาย",
                permissions: "ไม่พบสิทธิ์ที่มีผลจริง"
            }
        }
    },
    setting: {
        languages: {
            th: "ไทย (th)",
            en: "อังกฤษ (en)"
        },
        emailNotifications: {
            title: "การแจ้งเตือนอีเมล",
            subtitle: "จัดการ workflow override ของ IVTS ที่ delegated ไปยัง IAM สำหรับอีเมลด้าน identity เช่น คำเชิญบัญชี รหัส 2FA และการแจ้งเปลี่ยนสถานะบัญชี",
            tableTitle: "จัดการ Email Workflow",
            add: "เพิ่ม Template",
            empty: "ไม่พบ template อีเมล",
            fields: {
                template: "Template",
                channel: "ช่องทาง",
                source: "แหล่งที่มา",
                subject: "หัวข้อ",
                state: "สถานะ"
            },
            delivery: {
                title: "ตั้งค่าการส่ง",
                appName: "ชื่อแอปพลิเคชัน",
                appUrl: "URL แอปพลิเคชัน",
                fromName: "ชื่อผู้ส่ง",
                from: "อีเมลผู้ส่ง",
                replyTo: "อีเมลตอบกลับ",
                smtp: "SMTP",
                host: "Host",
                port: "Port",
                user: "Username",
                password: "Password",
                passwordConfigured: "Password (ตั้งค่าแล้ว)",
                passwordHint: "เว้นว่างเพื่อใช้ password เดิม",
                secure: "ใช้ SMTP แบบ secure (TLS/465)",
                save: "บันทึกการส่ง"
            },
            templates: {
                invite: "Invite Email",
                inviteChannel: "คำเชิญบัญชี",
                twoFa: "2FA Email",
                twoFaChannel: "ยืนยันตัวตนตอนเข้าสู่ระบบ",
                locked: "อีเมลแจ้งบัญชีถูกล็อก",
                lockedChannel: "การแจ้งเตือนเมื่อบัญชีถูกล็อก",
                unlocked: "อีเมลแจ้งปลดล็อกบัญชี",
                unlockedChannel: "การแจ้งเตือนเมื่อบัญชีกลับมาใช้งานได้",
                activated: "อีเมลแจ้งเปิดใช้งานบัญชี",
                activatedChannel: "การแจ้งเตือนเมื่อบัญชีถูกเปิดใช้งาน",
                deactivated: "อีเมลแจ้งปิดใช้งานบัญชี",
                deactivatedChannel: "การแจ้งเตือนเมื่อบัญชีถูกปิดใช้งาน",
                suspended: "อีเมลแจ้งระงับบัญชี",
                suspendedChannel: "การแจ้งเตือนเมื่อบัญชีถูกระงับ",
                archived: "อีเมลแจ้งจัดเก็บบัญชี",
                archivedChannel: "การแจ้งเตือนเมื่อบัญชีถูกจัดเก็บ",
                statusChanged: "อีเมลแจ้งสถานะบัญชีเปลี่ยนแปลง",
                statusChangedChannel: "การแจ้งเตือนเมื่อสถานะบัญชีเปลี่ยนแปลง",
                accessChanged: "อีเมลแจ้งสิทธิ์การเข้าถึงเปลี่ยนแปลง",
                accessChangedChannel: "การแจ้งเตือนเมื่อกลุ่มสิทธิ์เปลี่ยนแปลง",
                provisioned: "อีเมลแจ้งการ provision บัญชี",
                provisionedChannel: "การแจ้งเตือนเมื่อ provision สิทธิ์ให้บัญชี",
                deprovisioned: "อีเมลแจ้งการ deprovision บัญชี",
                deprovisionedChannel: "การแจ้งเตือนเมื่อยกเลิกสิทธิ์ของบัญชี",
                sessionsCleared: "อีเมลแจ้งลงชื่อออกทุกเซสชัน",
                sessionsClearedChannel: "การแจ้งเตือนเมื่อออกจากระบบทุกเซสชัน",
                trustedDeviceAdded: "อีเมลยืนยันอุปกรณ์ที่เชื่อถือได้",
                trustedDeviceAddedChannel: "การยืนยันการจดจำอุปกรณ์",
                sessionRevoked: "อีเมลแจ้งเพิกถอนเซสชัน",
                sessionRevokedChannel: "การแจ้งเตือนเมื่อเซสชันถูกเพิกถอน",
                trustedDeviceRevoked: "อีเมลแจ้งลบอุปกรณ์ที่เชื่อถือได้",
                trustedDeviceRevokedChannel: "การแจ้งเตือนเมื่อลบอุปกรณ์ที่จดจำไว้"
            },
            form: {
                createTitle: "เพิ่ม Template อีเมล",
                editTitle: "แก้ไข Template อีเมล",
                editHint: "แก้ไขหัวข้อ ข้อความ และ HTML body สำหรับการแจ้งเตือนนี้",
                preview: "ตัวอย่าง",
                htmlPreview: "ตัวอย่าง HTML",
                fields: {
                    eventKey: "Event key",
                    templateName: "ชื่อ Template",
                    description: "คำอธิบาย",
                    placeholders: "Custom placeholders",
                    text: "Text body",
                    html: "HTML body"
                },
                validation: {
                    subject: "กรุณาระบุหัวข้ออีเมล",
                    customTemplate: "กรุณาระบุ event key, ชื่อ template และหัวข้ออีเมล"
                }
            },
            placeholders: {
                title: "Template Placeholders",
                appId: "ขอบเขตแอปพลิเคชัน",
                appName: "ชื่อแอปพลิเคชัน",
                appUrl: "URL แอปพลิเคชัน",
                email: "อีเมลผู้รับ",
                firstName: "ชื่อผู้รับ",
                lastName: "นามสกุลผู้รับ",
                fullName: "ชื่อเต็มผู้รับ",
                code: "รหัสยืนยัน 2FA",
                expiresMinutes: "จำนวนนาทีที่รหัส 2FA หมดอายุ",
                invited: "สถานะการเชิญ",
                fromStatus: "สถานะบัญชีก่อนหน้า",
                toStatus: "สถานะบัญชีใหม่",
                statusTitle: "ชื่อสถานะปัจจุบัน",
                statusDescription: "คำอธิบายสถานะปัจจุบัน",
                groupCount: "จำนวนกลุ่มสิทธิ์ที่ได้รับ",
                currentGroups: "กลุ่มสิทธิ์ปัจจุบัน",
                addedGroups: "กลุ่มสิทธิ์ที่เพิ่ม",
                removedGroups: "กลุ่มสิทธิ์ที่ถูกลบ",
                changedBy: "ผู้ที่แก้ไข",
                targetStatus: "สถานะบัญชีเป้าหมาย",
                provisioningState: "สถานะ provisioning",
                provisioningStrategy: "กลยุทธ์ provisioning",
                recommendedProfiles: "access profile ที่แนะนำ",
                matchedRuleCount: "จำนวน lifecycle rule ที่ตรง",
                warningCount: "จำนวนคำเตือนของ lifecycle",
                deprovisionReason: "เหตุผลของการ deprovision",
                revokeSessions: "ยกเลิก active sessions",
                clearTrustedDevices: "ล้าง trusted devices",
                triggeredBy: "ผู้ที่สั่งทำรายการ",
                sessionCount: "จำนวนเซสชันที่ถูกออกจากระบบ",
                deviceIds: "รหัสอุปกรณ์ที่ถูกออกจากระบบ",
                currentSessionIncluded: "รวมเซสชันปัจจุบันหรือไม่",
                clearedBy: "ผู้ที่สั่งออกจากระบบ",
                sessionId: "รหัสเซสชัน",
                deviceId: "รหัสอุปกรณ์",
                clientId: "รหัส OAuth client",
                audience: "ขอบเขต audience",
                system: "ระบบแอปพลิเคชัน",
                userAgent: "User agent ของอุปกรณ์",
                lastIp: "IP ล่าสุดที่ทราบ",
                trustedAt: "เวลาที่จดจำอุปกรณ์",
                expiresAt: "เวลาหมดอายุ",
                revokedBy: "ผู้ที่สั่งเพิกถอน"
            },
            sources: {
                default: "ค่าเริ่มต้นของระบบ",
                override: "Workflow Override",
                inherited: "สืบทอดจากระบบ"
            },
            messages: {
                loadError: "ไม่สามารถโหลดการตั้งค่าอีเมลได้",
                saved: "บันทึกการตั้งค่าอีเมลแล้ว",
                saveError: "ไม่สามารถบันทึกการตั้งค่าอีเมลได้",
                workflowSaved: "บันทึก workflow override แล้ว",
                workflowSaveError: "ไม่สามารถบันทึก workflow override ได้",
                workflowRemoved: "ลบ workflow override แล้ว",
                workflowRemoveError: "ไม่สามารถลบ workflow override ได้",
                removeConfirmTitle: "ลบ Override",
                removeConfirmMessage: "ลบ workflow override ของ {template} หรือไม่?"
            }
        },
        workflowActions: {
            title: "Workflow Actions",
            subtitle: "ตั้งค่าพฤติกรรม action ของ IVTS email workflow ที่ delegated ไปยัง IAM เช่น ผู้รับ การเปิดใช้งาน และเงื่อนไขขณะรันระบบ",
            eventsTitle: "Workflow Events",
            emptySelection: "เลือก workflow event",
            fields: {
                actionType: "ประเภท Action",
                actionEnabled: "เปิดใช้งาน action นี้",
                recipientMode: "รูปแบบผู้รับ",
                recipientValue: "ค่าผู้รับ",
                conditionField: "ฟิลด์เงื่อนไข",
                templateSubject: "หัวข้อ Template"
            },
            actionTypes: {
                email: "ส่งอีเมล"
            },
            recipientModes: {
                request: "ผู้รับจาก request",
                context: "ฟิลด์จาก context",
                literal: "อีเมลคงที่"
            },
            placeholders: {
                contextRecipient: "email",
                literalRecipient: "ops@example.com",
                conditionField: "invited"
            },
            actions: {
                save: "บันทึก Action"
            },
            messages: {
                loadError: "ไม่สามารถโหลด workflow actions ได้",
                saved: "บันทึก workflow action แล้ว",
                saveError: "ไม่สามารถบันทึก workflow action ได้"
            }
        },
        runtimeAccess: {
            title: "สิทธิ์การเข้าถึงขณะรันระบบ",
            subtitle: "จัดการ browser origins, socket origins, reverse proxy, rate limit และรายการ IP ที่อนุญาตได้จากหน้า CMS โดยไม่ต้อง redeploy",
            cardTitle: "ควบคุมการเข้าถึงระหว่างรันระบบ",
            sourceLabel: "แหล่งค่าปัจจุบัน",
            defaultsTitle: "ค่า fallback จาก environment",
            fields: {
                trustProxy: "เชื่อถือ header จาก reverse proxy",
                rateLimitEnabled: "เปิดใช้ rate limit และการบล็อก IP ชั่วคราว",
                corsAllowedOrigins: "Browser CORS origins ที่อนุญาต",
                socketCorsOrigins: "Socket.IO origins ที่อนุญาต",
                allowedIPs: "Client IP ที่อนุญาต"
            },
            hints: {
                trustProxy: "ใช้ X-Forwarded-* เมื่อ IVTS อยู่หลัง reverse proxy หรือ ingress",
                rateLimitEnabled: "เมื่อปิด จะไม่ตรวจ throttling และไม่บล็อก IP ชั่วคราว",
                corsAllowedOrigins: "หนึ่ง origin ต่อหนึ่งบรรทัด และต้องตรงแบบ exact match เช่น https://mca.mfu.ac.th",
                socketCorsOrigins: "หนึ่ง origin ต่อหนึ่งบรรทัด ควรตั้งให้สอดคล้องกับ browser origins เพื่อให้ websocket ทำงานต่อเนื่อง",
                allowedIPs: "หนึ่ง IP ต่อหนึ่งบรรทัด เว้นว่างเพื่ออนุญาตทุก IP หลังผ่าน authentication และ CORS แล้ว"
            },
            placeholders: {
                origins: "https://mca.mfu.ac.th\nhttps://iam.mfu.ac.th",
                ips: "192.168.10.10\n10.20.30.40"
            },
            sources: {
                database: "ฐานข้อมูล",
                environment: "fallback จาก environment"
            },
            monitoring: {
                blockedTitle: "IP ที่ถูกบล็อกอยู่ตอนนี้",
                blockedSubtitle: "รายการ IP ที่ยังถูกบล็อกโดย runtime rate limit ในขณะนี้",
                eventsTitle: "เหตุการณ์ runtime ล่าสุด",
                eventsSubtitle: "บันทึกการ deny และ block ล่าสุดที่เกิดจาก runtime access controls",
                eventsHint: "หน้านี้เก็บเฉพาะเหตุการณ์ deny และ block ล่าสุดใน memory ของ backend เท่านั้น และจะถูกล้างเมื่อ backend restart",
                emptyBlocked: "ยังไม่มี IP ที่ถูกบล็อกอยู่",
                emptyEvents: "ยังไม่มีเหตุการณ์ runtime access",
                fields: {
                    occurredAt: "เวลาเกิดเหตุการณ์",
                    ip: "IP",
                    source: "แหล่งที่มา",
                    reason: "เหตุผล",
                    blockedAt: "เวลาที่เริ่มบล็อก",
                    expiresAt: "เวลาปลดบล็อก",
                    remaining: "เวลาคงเหลือ",
                    target: "คำขอ",
                    type: "ประเภท",
                    decision: "ผลลัพธ์",
                    statusCode: "สถานะ",
                    message: "ข้อความ",
                    detail: "รายละเอียด",
                    actions: "จัดการ"
                },
                remainingExpired: "หมดอายุแล้ว",
                remainingMinutes: "{minutes} นาที",
                remainingMinutesSeconds: "{minutes} นาที {seconds} วินาที",
                remainingSeconds: "{seconds} วินาที"
            },
            actions: {
                useFallback: "ใช้ค่า fallback",
                unblock: "ปลดบล็อก"
            },
            messages: {
                loadError: "ไม่สามารถโหลดค่าการเข้าถึงขณะรันระบบได้",
                saved: "บันทึกค่าการเข้าถึงขณะรันระบบแล้ว",
                permissionDenied: "คุณไม่มีสิทธิ์แก้ไขค่าการเข้าถึงขณะรันระบบ",
                saveError: "ไม่สามารถบันทึกค่าการเข้าถึงขณะรันระบบได้",
                defaultsApplied: "คัดลอกค่า fallback ลงในฟอร์มแล้ว",
                unblocked: "ปลดบล็อก IP แล้ว",
                unblockError: "ไม่สามารถปลดบล็อก IP นี้ได้"
            }
        },
        databaseBackup: {
            title: "สำรองฐานข้อมูล",
            subtitle: "จัดการ backup ฐานข้อมูลของ IVTS ผ่าน CMS ทั้งการตั้ง auto backup, สั่ง manual, retention, download และลบไฟล์เก่า",
            cardTitle: "ตั้งค่า Backup",
            previewTitle: "Preview Collections",
            previewEmpty: "กด Preview Collections เพื่อตรวจสอบ collection ที่จะรวมใน backup",
            previewNotLoaded: "ยังไม่ได้ preview",
            previewLoaded: "Preview เมื่อ {time}, {documents} เอกสาร",
            historyTitle: "ประวัติ Backup",
            historyPreviewTitle: "Preview ไฟล์ Backup",
            historyPreviewEmpty: "เลือก preview จากประวัติ backup เพื่อตรวจสอบ collection ในไฟล์",
            historyPreviewLoaded: "{name}, สร้างเมื่อ {createdAt}, {documents} เอกสาร",
            activeBadge: "กำลัง backup",
            fields: {
                autoEnabled: "Auto backup",
                enabled: "เปิดใช้งาน",
                disabled: "ปิดใช้งาน",
                intervalHours: "รอบเวลาเป็นชั่วโมง",
                retentionCount: "จำนวน Auto backup ที่เก็บไว้",
                backupDir: "โฟลเดอร์เก็บไฟล์",
                collectionName: "Collection",
                type: "ประเภท",
                mode: "รูปแบบ",
                status: "สถานะ",
                databaseName: "ฐานข้อมูล",
                startedAt: "เริ่มเมื่อ",
                completedAt: "เสร็จเมื่อ",
                sizeBytes: "ขนาด",
                collections: "Collections",
                documentCount: "เอกสาร",
                checksum: "SHA-256",
                actions: "จัดการ"
            },
            modes: {
                auto: "Auto",
                manual: "Manual"
            },
            statuses: {
                completed: "เสร็จแล้ว",
                running: "กำลังทำงาน",
                failed: "ล้มเหลว"
            },
            actions: {
                previewCollections: "Preview Collections",
                saveSettings: "บันทึกการตั้งค่า",
                runNow: "สั่ง Backup",
                previewBackup: "Preview",
                restore: "Restore",
                download: "Download",
                delete: "ลบ"
            },
            messages: {
                loadError: "ไม่สามารถโหลดค่าการ backup ฐานข้อมูลได้",
                saved: "บันทึกค่าการ backup ฐานข้อมูลแล้ว",
                saveError: "ไม่สามารถบันทึกค่าการ backup ฐานข้อมูลได้",
                manualStarted: "สั่ง backup ฐานข้อมูลสำเร็จแล้ว",
                manualError: "ไม่สามารถสั่ง backup ฐานข้อมูลได้",
                previewError: "ไม่สามารถ preview collection ของฐานข้อมูลได้",
                previewBackupError: "ไม่สามารถ preview backup นี้ได้",
                restored: "Restore ฐานข้อมูลสำเร็จแล้ว",
                restoreError: "ไม่สามารถ restore backup นี้ได้",
                restoreConfirmTitle: "Restore Backup",
                restoreConfirmMessage: "Restore backup {name} หรือไม่? ข้อมูล collection ปัจจุบันจะถูกแทนที่",
                deleted: "ลบ backup แล้ว",
                deleteError: "ไม่สามารถลบ backup ได้",
                downloadError: "ไม่สามารถ download backup ได้",
                permissionDenied: "คุณไม่มีสิทธิ์จัดการ backup ฐานข้อมูล",
                deleteConfirmTitle: "ลบ Backup",
                deleteConfirmMessage: "ลบ backup {name} หรือไม่?"
            }
        },
        status: {
            title: "ตั้งค่าสถานะ",
            subtitle: "จัดการคีย์สถานะ ชื่อ คำอธิบาย และสถานะการใช้งานสำหรับข้อมูล master ที่ใช้ร่วมกัน",
            tableTitle: "จัดการสถานะ",
            add: "เพิ่มสถานะ",
            empty: "ไม่พบสถานะ",
            editTitle: "แก้ไขสถานะ",
            createTitle: "สร้างสถานะ",
            fields: {
                group: "กลุ่ม",
                key: "คีย์",
                title: "ชื่อ",
                description: "คำอธิบาย",
                titleTh: "ชื่อ (TH)",
                titleEn: "ชื่อ (EN)",
                descriptionTh: "คำอธิบาย (TH)",
                descriptionEn: "คำอธิบาย (EN)",
                state: "สถานะ"
            },
            form: {
                editHint: "อัปเดตสถานะที่รองรับหลายภาษา",
                createHint: "กำหนดค่าสถานะที่รองรับหลายภาษา",
                fields: {
                    title: "ชื่อ",
                    group: "กลุ่ม",
                    key: "คีย์",
                    state: "สถานะ"
                },
                validation: {
                    required: "กรุณากรอกข้อมูลที่จำเป็นให้ครบ",
                    title: "กรุณาระบุชื่ออย่างน้อยหนึ่งภาษา",
                    group: "กรุณาเลือกกลุ่ม",
                    key: "กรุณาระบุคีย์สถานะ"
                }
            },
            messages: {
                loadError: "ไม่สามารถโหลดรายการสถานะได้",
                loadSelectedError: "ไม่สามารถโหลดสถานะที่เลือกได้",
                updated: "อัปเดตสถานะแล้ว",
                created: "สร้างสถานะสำเร็จ",
                saveError: "ไม่สามารถบันทึกสถานะได้",
                removeTitle: "ลบสถานะ",
                removeConfirm: "ยืนยันการลบสถานะนี้ใช่หรือไม่",
                removed: "ลบสถานะแล้ว",
                removeError: "ไม่สามารถลบสถานะได้"
            }
        }
    },
    security: {
        messages: {
            loadError: "ไม่สามารถโหลดข้อมูลความปลอดภัยได้"
        },
        createMenu: {
            title: "สร้างเมนู",
            subtitle: "จัดการประเภทเมนู ลงทะเบียน path สำหรับการใช้งาน และดูแล catalog ของสิทธิ์ให้สอดคล้องกัน",
            editMenu: "แก้ไขเมนู",
            addType: "เพิ่มประเภท",
            editType: "แก้ไขประเภท",
            menusTitle: "เมนู",
            typesTitle: "จัดการประเภท",
            addMenu: "เพิ่มเมนู",
            emptyMenus: "ไม่พบเมนู",
            emptyTypes: "ไม่พบประเภท",
            fields: {
                menuTitle: "ชื่อเมนู",
                path: "พาธ",
                type: "ประเภท",
                typeTitle: "ชื่อประเภท"
            },
            stats: {
                types: "ประเภท",
                menus: "เมนู",
                mapped: "รายการที่แมป"
            },
            messages: {
                typeUpdated: "อัปเดตประเภทแล้ว",
                typeCreated: "สร้างประเภทสำเร็จ",
                cannotSaveType: "ไม่สามารถบันทึกประเภทได้",
                typeRemoved: "ลบประเภทแล้ว",
                typeInUse: "ไม่สามารถลบประเภทที่กำลังใช้งานได้",
                mappedReadonly: "เมนูที่แมปจากระบบไม่สามารถแก้ไขได้",
                menuUpdated: "อัปเดตเมนูแล้ว",
                menuCreated: "สร้างเมนูสำเร็จ",
                cannotSaveMenu: "ไม่สามารถบันทึกเมนูได้",
                mappedRemove: "เมนูที่แมปจากระบบไม่สามารถลบได้",
                menuRemoved: "ลบเมนูแล้ว",
                cannotRemoveMenu: "ไม่สามารถลบเมนูได้"
            }
        },
        createGroup: {
            title: "สร้างกลุ่ม",
            subtitle: "กำหนดกลุ่มสิทธิ์ กำหนดการมองเห็นตามประเภท และทำให้โครงสร้างการกำหนดสิทธิ์อ่านง่าย",
            editGroup: "แก้ไขกลุ่ม",
            tableTitle: "กลุ่ม",
            addGroup: "เพิ่มกลุ่ม",
            empty: "ไม่พบกลุ่ม",
            fields: {
                groupTitle: "ชื่อกลุ่ม",
                visibleType: "ประเภทที่มองเห็นได้"
            },
            stats: {
                groups: "กลุ่ม",
                visibleTypes: "ประเภทที่มองเห็น",
                readyToAssign: "พร้อมนำไปกำหนด"
            },
            messages: {
                groupUpdated: "อัปเดตกลุ่มแล้ว",
                groupCreated: "สร้างกลุ่มสำเร็จ",
                cannotSave: "ไม่สามารถบันทึกกลุ่มได้",
                groupRemoved: "ลบกลุ่มแล้ว",
                cannotRemove: "ไม่สามารถลบกลุ่มได้"
            }
        },
        permissionManagement: {
            title: "จัดการสิทธิ์การใช้งาน",
            subtitle: "ทำตามลำดับการตั้งค่าเพื่อกำหนดเมนู สร้างกลุ่ม และควบคุม permission matrix ขั้นสุดท้าย",
            recommendedFlow: "ลำดับการทำงานที่แนะนำ",
            stats: {
                step1: "ขั้นตอนที่ 1",
                step2: "ขั้นตอนที่ 2",
                step3: "ขั้นตอนที่ 3",
                menu: "เมนู",
                group: "กลุ่ม",
                matrix: "ตารางสิทธิ์"
            },
            steps: {
                menu: {
                    eyebrow: "พื้นฐาน",
                    title: "สร้างเมนู",
                    description: "ลงทะเบียนรายการเมนู แมป path และเตรียม catalog สำหรับ permission"
                },
                group: {
                    eyebrow: "การจัดกลุ่ม",
                    title: "สร้างกลุ่ม",
                    description: "สร้างกลุ่มสิทธิ์และกำหนดว่าแต่ละกลุ่มจะเห็นเมนูประเภทใดได้บ้าง"
                },
                matrix: {
                    eyebrow: "การควบคุม",
                    title: "ตารางสิทธิ์",
                    description: "กำหนดกฎสิทธิ์สุดท้ายว่าแต่ละกลุ่มจะทำอะไรได้บ้าง"
                }
            },
            guide: {
                menuLabel: "1. สร้างเมนู",
                menuText: "ลงทะเบียนประเภทเมนูและ path ก่อน เพื่อให้ permission matrix มีรายการเป้าหมายที่ชัดเจน",
                groupLabel: "2. สร้างกลุ่ม",
                groupText: "กำหนดกลุ่มสิทธิ์และขอบเขตประเภทที่แต่ละกลุ่มมองเห็นได้ก่อนตั้งค่ากฎ",
                matrixLabel: "3. ตารางสิทธิ์",
                matrixText: "กำหนดสิทธิ์ดู แก้ไข ลบ ทำรายการ และดูบันทึก เมื่อเมนูและกลุ่มพร้อมแล้ว"
            }
        },
        auditExplorer: {
            title: "สำรวจบันทึกการใช้งาน",
            subtitle: "ตรวจสอบเหตุการณ์ด้านการยืนยันตัวตน บัญชีผู้ใช้ และวงจรตัวตนที่ระบบ IAM บันทึกไว้",
            eventsLoaded: "จำนวนเหตุการณ์",
            exportFile: "iam-audit-events.csv",
            filters: {
                module: "โมดูล",
                action: "การกระทำ",
                actorId: "รหัสผู้กระทำ",
                resourceId: "รหัสทรัพยากร"
            },
            fields: {
                timestamp: "เวลา",
                module: "โมดูล",
                action: "การกระทำ",
                actor: "ผู้กระทำ",
                resource: "ทรัพยากร",
                ip: "ไอพี",
                detail: "รายละเอียด"
            },
            stats: {
                events: "เหตุการณ์",
                auth: "ยืนยันตัวตน",
                accounts: "บัญชีผู้ใช้"
            },
            messages: {
                loadError: "ไม่สามารถโหลดเหตุการณ์บันทึกได้"
            }
        },
        formModal: {
            group: {
                editHint: "อัปเดตกลุ่มสิทธิ์และขอบเขตประเภทที่กลุ่มนี้มองเห็นได้",
                createHint: "สร้างกลุ่มสิทธิ์สำหรับใช้กำหนด permission",
                validationTitle: "กรุณากรอกชื่อกลุ่ม",
                validationVisibleType: "กรุณาเลือกประเภทที่มองเห็นได้"
            },
            menu: {
                editHint: "อัปเดตรายการเมนูที่ใช้ใน catalog สิทธิ์",
                createHint: "สร้างรายการเมนูและแมปเข้ากับประเภทความปลอดภัย",
                validationTitle: "กรุณากรอกชื่อเมนู",
                validationPath: "พาธต้องขึ้นต้นด้วย /",
                validationType: "กรุณาเลือกประเภท"
            },
            type: {
                editHint: "อัปเดตประเภทที่รองรับหลายภาษา",
                createHint: "กำหนดประเภทที่รองรับหลายภาษา",
                validationTitle: "กรุณากรอกชื่อประเภท"
            }
        },
        permissionMatrix: {
            title: "ตารางสิทธิ์การใช้งาน",
            subtitle: "ตรวจสอบสิทธิ์ตามกลุ่มและเมนู ปรับสิทธิ์การเข้าถึง และควบคุม permission matrix ให้เป็นระเบียบ",
            lastUpdated: "อัปเดตล่าสุด",
            selectedGroup: "กลุ่มที่เลือก",
            menus: "เมนู",
            visibleRules: "กฎที่แสดง",
            allTypes: "ทุกประเภท",
            tableTitle: "ตารางสิทธิ์",
            fields: {
                menu: "เมนู",
                type: "ประเภท",
                path: "พาธ",
                source: "แหล่งที่มา",
                all: "ทั้งหมด",
                view: "ดู",
                edit: "แก้ไข",
                delete: "ลบ",
                action: "ทำรายการ",
                owner: "เจ้าของ",
                logs: "บันทึก"
            },
            messages: {
                loadError: "ไม่สามารถโหลดข้อมูลสิทธิ์ได้",
                saveError: "ไม่สามารถบันทึกสิทธิ์ได้"
            }
        }
    }
}

th.nav = Object.assign({}, th.nav || {}, {
    projectOperations: 'พื้นที่แอปพลิเคชัน'
})

th.vehicleManagement = {
    title: 'จัดการทะเบียนรถ',
    subtitle: 'จัดการและตรวจสอบข้อมูลยานพาหนะที่ลงทะเบียน',
    sectionTitle: 'จัดการทะเบียนรถ',
    showing: 'แสดง 1-{count} จาก {total} คัน',
    statTotal: 'รถทั้งหมด',
    statPending: 'รอตรวจสอบ',
    statApproved: 'อนุมัติแล้ว',
    statRejected: 'ถูกปฏิเสธ',
    actions: 'จัดการ',
    noItems: 'ไม่พบรายการ',
    export: 'ส่งออก',
    tooltipApprove: 'อนุมัติ',
    tooltipReject: 'ปฏิเสธ',
    tooltipView: 'ดูรายละเอียด',
    tooltipDelete: 'ลบ'
}

th.cctvViewer = {
    subtitle: 'โหนดกล้องรักษาความปลอดภัยที่ลงทะเบียนในเครือข่าย campus',
    lastUpdated: 'อัปเดตล่าสุด',
    cameraNodes: 'กล้องทั้งหมด',
    nodes: 'โหนด',
    searchPlaceholder: 'ค้นหากล้อง...',
    noCamerasFound: 'ไม่พบกล้อง',
    connecting: 'กำลังเชื่อมต่อ...',
    connectionLost: 'การเชื่อมต่อกล้องขาดหาย',
    checkHardware: 'กรุณาตรวจสอบฮาร์ดแวร์หรือการตั้งค่าของกล้อง',
    cannotStream: 'ไม่สามารถแสดงผลสตรีมได้',
    connectionError: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
    checkUrlAccess: 'ตรวจสอบ URL และการเข้าถึงถูกต้องอีกครั้ง',
    noCamera: 'ยังไม่ได้เลือกกล้อง',
    selectCameraHint: 'เลือกกล้องจากเมนูด้านซ้ายเพื่อเริ่มดูภาพสด',
    rtspUnsupported: 'RTSP ไม่สามารถเล่นได้โดยตรงในเว็บเบราว์เซอร์ โปรดใช้ URL ที่เป็น HTTP/HTTPS snapshot หรือ proxy service ที่แปลงสตรีมให้เข้ากับเบราว์เซอร์',
    unsupportedUrl: 'กรุณาตรวจสอบ URL ของกล้อง หรือใช้ URL สำหรับรูปภาพ/สตรีมที่เบราว์เซอร์รองรับ'
}

th.settingGroup = {
    title: "Setting Group",
    subtitle: "Maintain reusable master groups, language titles, and visibility state for downstream settings.",
    tableTitle: "Group Management"
}

th.settingMessageAuthen = {
    title: "Setting Message Authen",
    subtitle: "Manage login message banners, display periods, and activation state from one workflow.",
    tableTitle: "Setting Message Authen"
}

th.settingMessage = {
    title: "Setting Message",
    subtitle: "Manage localized message templates and keep reusable communication copy aligned.",
    tableTitle: "Message Management"
}

th.settingVerification = {
    title: "Setting Verification",
    subtitle: "Manage verification definitions, related groups, and status mappings from one place.",
    tableTitle: "Verification Management"
}

th.ivtsOperatingDesk = {
    title: "IVTS Operating Desk",
    period: "Period 2026",
    menu: {
        dashboard: "Dashboard",
        approveVehicle: "Approve Vehicle",
        history: "History",
        report: "Report"
    }
}

th.ivtsRegistry = {
    title: "IVTS Registry",
    subtitle: "Track agreements, ownership, review state, and renewal timing in one IAM-protected workspace.",
    stats: {
        totalRegistry: "Total Registry",
        activeRegistry: "Active Registry",
        expiringSoon: "Expiring Soon",
        pendingReview: "Pending Review"
    },
    searchPlaceholder: "Search agreements...",
    settingModals: {
        common: {
            content: "Content",
            title: "Title",
            description: "Description",
            settings: "Settings",
            key: "Key",
            state: "State",
            status: "Status",
            active: "Active",
            inactive: "Inactive",
            draft: "Draft",
            created: "Created",
            updated: "Updated"
        },
        group: {
            createDesc: "Configure group that supports multiple languages.",
            updateDesc: "Update group that supports multiple languages.",
            createGroup: "Create Group"
        },
        message: {
            createDesc: "Configure system message that supports multiple languages.",
            updateDesc: "Update system message that supports multiple languages.",
            message: "Message",
            number: "Number",
            code: "Code",
            createMessage: "Create Message"
        },
        verification: {
            createDesc: "Configure verification setting with multilingual content.",
            updateDesc: "Update verification setting with multilingual content.",
            group: "Group",
            status: "Status",
            createVerification: "Create Verification"
        },
        messageAuthen: {
            createDesc: "Configure login announcement that supports multiple languages.",
            updateDesc: "Update login announcement that supports multiple languages.",
            recommendedMax: "Recommended 80 characters max",
            startDate: "Start date",
            endDate: "End date",
            dateError: "End date must be the same or later than start date.",
            createTitle: "Create Setting Message Authen",
            saveDraft: "Save as Draft",
            updateDraft: "Update as Draft"
        }
    },
    table: {
        agreementNo: "Agreement No",
        partner: "Partner",
        owner: "Owner",
        period: "Period",
        status: "Status",
        expires: "Expires",
        actions: "Actions"
    }
}

th.assignmentManagement = {
    title: "Assignment Management",
    subtitle: "Bind accounts to groups, define data scope, and control delegated access boundaries.",
    tableTitle: "Assignment Management",
    stats: {
        assignments: "Assignments",
        active: "Active",
        scoped: "Scoped"
    },
    fields: {
        account: "Account",
        group: "Group",
        dataScope: "Data Scope",
        scopeUnits: "Scope Units",
        active: "Status",
        actions: "#"
    },
    form: {
        account: "Account",
        group: "Group",
        dataScope: "Data Scope",
        active: "Active",
        scopeUnits: "Scope Units",
        scopeUnitsHint: "Comma-separated org unit codes/names"
    },
    actions: {
        add: "Add Assignment",
        edit: "Edit",
        delete: "Delete"
    },
    messages: {
        loadError: "Cannot load assignments.",
        created: "Assignment created.",
        updated: "Assignment updated.",
        saveError: "Cannot save assignment.",
        removed: "Assignment removed.",
        removeError: "Cannot remove assignment."
    },
    scopes: {
        self: "Self",
        unit: "Unit",
        org: "Org"
    }
}

th.receiveForm = {
    title: "แบบฟอร์มรับ / สืบมา",
    subtitle: "หน้าจอ mockup สำหรับบันทึกข้อมูลเอกสาร, แนบไฟล์, และตรวจผลลัพธ์ OCR ก่อนบันทึกเข้าระบบ",
    metaLabel: "โหมดข้อมูล",
    metaValue: "Mock data",
    sections: {
        documentInfo: "ข้อมูลเอกสาร",
        uploadFiles: "อัปโหลดไฟล์",
        ocrResults: "ผลลัพธ์ OCR",
        selectedItems: "รายการที่เตรียมบันทึก",
        summary: "สรุปการบันทึก"
    },
    fields: {
        documentNo: "เลขที่เอกสาร",
        receivedDate: "วันที่รับเอกสาร",
        documentType: "ประเภทเอกสาร",
        senderName: "หน่วยงาน/ผู้ส่ง",
        destination: "หน่วยงานผู้รับผิดชอบ",
        priority: "ระดับความเร่งด่วน",
        contactName: "ผู้ประสานงาน",
        contactPhone: "เบอร์ติดต่อ",
        expectedDocuments: "จำนวนรายการคาดการณ์",
        note: "หมายเหตุ"
    },
    upload: {
        selectFile: "เลือกไฟล์",
        clearUploads: "ล้างรายการ",
        caption: "อัปโหลดเอกสารไฟล์ PDF / JPG / JPEG / PNG เพื่อจำลองขั้นตอน OCR",
        dropzoneHint: "ประเภทที่รองรับ: PDF, JPG, JPEG, PNG",
        sizeHint: "ขนาดไฟล์ไม่เกิน 10MB",
        empty: "ยังไม่มีไฟล์ที่อัปโหลด"
    },
    ocrTable: {
        documentName: "ชื่อเอกสาร",
        referenceNo: "เลขอ้างอิง",
        category: "ประเภท",
        confidence: "ความมั่นใจ",
        status: "สถานะ",
        actions: "การดำเนินการ"
    },
    selectedList: {
        empty: "ยังไม่มีรายการที่เลือกจากผล OCR",
        remove: "ลบ",
        confidence: "ความมั่นใจ"
    },
    summaryList: {
        totalFiles: "จำนวนไฟล์",
        readyOcr: "ผล OCR พร้อมใช้งาน",
        selectedItems: "รายการที่เลือก",
        expectedDocs: "เอกสารคาดการณ์"
    },
    actions: {
        save: "บันทึกข้อมูล",
        reset: "เริ่มใหม่"
    },
    stats: {
        uploadedFiles: "Uploaded Files",
        uploadedFilesHint: "จำนวนไฟล์ที่แนบใน mock session",
        ocrReady: "OCR Ready",
        ocrReadyHint: "รายการที่พร้อมบันทึกโดยไม่ต้องแก้เพิ่ม",
        selectedItems: "Selected Items",
        selectedItemsHint: "รายการที่ถูกเลือกเพื่อบันทึกเข้าระบบ"
    },
    status: {
        ready: "พร้อมบันทึก",
        review: "ตรวจสอบ"
    },
    messages: {
        filesAdded: "เพิ่มไฟล์จำลองแล้ว {count} รายการ",
        filesCleared: "ล้างรายการไฟล์ที่อัปโหลดแล้ว",
        alreadySelected: "รายการนี้ถูกเลือกไว้แล้ว",
        fillRequired: "กรุณากรอกข้อมูลเอกสารให้ครบก่อนบันทึก",
        selectOcrRequired: "กรุณาเลือกรายการจากผล OCR อย่างน้อย 1 รายการ",
        saveSuccess: "บันทึกข้อมูล mock สำเร็จ {count} รายการ"
    },
    documentTypes: {
        incoming: "หนังสือรับเข้า",
        memo: "บันทึกข้อความ",
        project: "เอกสารโครงการ"
    },
    destinations: {
        saraban: "งานสารบรรณกลาง",
        secretary: "สำนักงานเลขานุการ",
        academic: "ฝ่ายวิชาการ"
    },
    priorities: {
        normal: "ปกติ",
        urgent: "ด่วน",
        veryUrgent: "ด่วนที่สุด"
    },
    headerAccount: {
        avatarAlt: "รูปบัญชีผู้ใช้",
        checkProfile: "ข้อมูลโปรไฟล์",
        logout: "ออกจากระบบ",
        accountFallback: "บัญชีผู้ใช้",
        noOrganizationData: "ไม่พบข้อมูลหน่วยงาน",
        unit: "หน่วยงาน",
        affiliation: "สังกัด",
        accountCode: "Account Code",
        role: "Role",
        email: "อีเมล",
        position: "ตำแหน่ง",
        personnelType: "ประเภทบุคลากร",
        changeProfilePhoto: "เปลี่ยนรูปโปรไฟล์",
        imageTypeError: "กรุณาเลือกรูปภาพเท่านั้น",
        imageSizeError: "รูปต้องมีขนาดไม่เกิน 3 MB",
        imageReadError: "ไม่สามารถอ่านรูปที่เลือกได้",
        imageSaveError: "ไม่สามารถอัปเดตรูปโปรไฟล์ได้"
    },
    countup: {
        elapsed: "ผ่านไปแล้ว:",
        hours: "ชั่วโมง",
        minutes: "นาที",
        seconds: "วินาที"
    },
    dialog: {
        disasterAlert: "แจ้งเหตุฉุกเฉิน"
    },
    asset: {
        food: "อาหาร",
        verification: {
            createDesc: "Configure verification setting with multilingual content.",
            updateDesc: "Update verification setting with multilingual content.",
            group: "Group",
            status: "Status",
            createVerification: "Create Verification"
        },
        messageAuthen: {
            createDesc: "Configure login announcement that supports multiple languages.",
            updateDesc: "Update login announcement that supports multiple languages.",
            recommendedMax: "Recommended 80 characters max",
            startDate: "Start date",
            endDate: "End date",
            dateError: "End date must be the same or later than start date.",
            createTitle: "Create Setting Message Authen",
            saveDraft: "Save as Draft",
            updateDraft: "Update as Draft"
        }
    },
    table: {
        agreementNo: "Agreement No",
        partner: "Partner",
        owner: "Owner",
        period: "Period",
        status: "Status",
        expires: "Expires",
        actions: "Actions"
    }
}

th.assignmentManagement = {
    title: "Assignment Management",
    subtitle: "Bind accounts to groups, define data scope, and control delegated access boundaries.",
    tableTitle: "Assignment Management",
    stats: {
        assignments: "Assignments",
        active: "Active",
        scoped: "Scoped"
    },
    fields: {
        account: "Account",
        group: "Group",
        dataScope: "Data Scope",
        scopeUnits: "Scope Units",
        active: "Status",
        actions: "#"
    },
    form: {
        account: "Account",
        group: "Group",
        dataScope: "Data Scope",
        active: "Active",
        scopeUnits: "Scope Units",
        scopeUnitsHint: "Comma-separated org unit codes/names"
    },
    actions: {
        add: "Add Assignment",
        edit: "Edit",
        delete: "Delete"
    },
    messages: {
        loadError: "Cannot load assignments.",
        created: "Assignment created.",
        updated: "Assignment updated.",
        saveError: "Cannot save assignment.",
        removed: "Assignment removed.",
        removeError: "Cannot remove assignment."
    },
    scopes: {
        self: "Self",
        unit: "Unit",
        org: "Org"
    }
}

th.receiveForm = {
    title: "แบบฟอร์มรับ / สืบมา",
    subtitle: "หน้าจอ mockup สำหรับบันทึกข้อมูลเอกสาร, แนบไฟล์, และตรวจผลลัพธ์ OCR ก่อนบันทึกเข้าระบบ",
    metaLabel: "โหมดข้อมูล",
    metaValue: "Mock data",
    sections: {
        documentInfo: "ข้อมูลเอกสาร",
        uploadFiles: "อัปโหลดไฟล์",
        ocrResults: "ผลลัพธ์ OCR",
        selectedItems: "รายการที่เตรียมบันทึก",
        summary: "สรุปการบันทึก"
    },
    fields: {
        documentNo: "เลขที่เอกสาร",
        receivedDate: "วันที่รับเอกสาร",
        documentType: "ประเภทเอกสาร",
        senderName: "หน่วยงาน/ผู้ส่ง",
        destination: "หน่วยงานผู้รับผิดชอบ",
        priority: "ระดับความเร่งด่วน",
        contactName: "ผู้ประสานงาน",
        contactPhone: "เบอร์ติดต่อ",
        expectedDocuments: "จำนวนรายการคาดการณ์",
        note: "หมายเหตุ"
    },
    upload: {
        selectFile: "เลือกไฟล์",
        clearUploads: "ล้างรายการ",
        caption: "อัปโหลดเอกสารไฟล์ PDF / JPG / JPEG / PNG เพื่อจำลองขั้นตอน OCR",
        dropzoneHint: "ประเภทที่รองรับ: PDF, JPG, JPEG, PNG",
        sizeHint: "ขนาดไฟล์ไม่เกิน 10MB",
        empty: "ยังไม่มีไฟล์ที่อัปโหลด"
    },
    ocrTable: {
        documentName: "ชื่อเอกสาร",
        referenceNo: "เลขอ้างอิง",
        category: "ประเภท",
        confidence: "ความมั่นใจ",
        status: "สถานะ",
        actions: "การดำเนินการ"
    },
    selectedList: {
        empty: "ยังไม่มีรายการที่เลือกจากผล OCR",
        remove: "ลบ",
        confidence: "ความมั่นใจ"
    },
    summaryList: {
        totalFiles: "จำนวนไฟล์",
        readyOcr: "ผล OCR พร้อมใช้งาน",
        selectedItems: "รายการที่เลือก",
        expectedDocs: "เอกสารคาดการณ์"
    },
    actions: {
        save: "บันทึกข้อมูล",
        reset: "เริ่มใหม่"
    },
    stats: {
        uploadedFiles: "Uploaded Files",
        uploadedFilesHint: "จำนวนไฟล์ที่แนบใน mock session",
        ocrReady: "OCR Ready",
        ocrReadyHint: "รายการที่พร้อมบันทึกโดยไม่ต้องแก้เพิ่ม",
        selectedItems: "Selected Items",
        selectedItemsHint: "รายการที่ถูกเลือกเพื่อบันทึกเข้าระบบ"
    },
    status: {
        ready: "พร้อมบันทึก",
        review: "ตรวจสอบ"
    },
    messages: {
        filesAdded: "เพิ่มไฟล์จำลองแล้ว {count} รายการ",
        filesCleared: "ล้างรายการไฟล์ที่อัปโหลดแล้ว",
        alreadySelected: "รายการนี้ถูกเลือกไว้แล้ว",
        fillRequired: "กรุณากรอกข้อมูลเอกสารให้ครบก่อนบันทึก",
        selectOcrRequired: "กรุณาเลือกรายการจากผล OCR อย่างน้อย 1 รายการ",
        saveSuccess: "บันทึกข้อมูล mock สำเร็จ {count} รายการ"
    },
    documentTypes: {
        incoming: "หนังสือรับเข้า",
        memo: "บันทึกข้อความ",
        project: "เอกสารโครงการ"
    },
    destinations: {
        saraban: "งานสารบรรณกลาง",
        secretary: "สำนักงานเลขานุการ",
        academic: "ฝ่ายวิชาการ"
    },
    priorities: {
        normal: "ปกติ",
        urgent: "ด่วน",
        veryUrgent: "ด่วนที่สุด"
    },
    headerAccount: {
        avatarAlt: "รูปบัญชีผู้ใช้",
        checkProfile: "ข้อมูลโปรไฟล์",
        logout: "ออกจากระบบ",
        accountFallback: "บัญชีผู้ใช้",
        noOrganizationData: "ไม่พบข้อมูลหน่วยงาน",
        unit: "หน่วยงาน",
        affiliation: "สังกัด",
        accountCode: "Account Code",
        role: "Role",
        email: "อีเมล",
        position: "ตำแหน่ง",
        personnelType: "ประเภทบุคลากร",
        changeProfilePhoto: "เปลี่ยนรูปโปรไฟล์",
        imageTypeError: "กรุณาเลือกรูปภาพเท่านั้น",
        imageSizeError: "รูปต้องมีขนาดไม่เกิน 3 MB",
        imageReadError: "ไม่สามารถอ่านรูปที่เลือกได้",
        imageSaveError: "ไม่สามารถอัปเดตรูปโปรไฟล์ได้"
    },
    countup: {
        elapsed: "ผ่านไปแล้ว:",
        hours: "ชั่วโมง",
        minutes: "นาที",
        seconds: "วินาที"
    },
    dialog: {
        disasterAlert: "แจ้งเหตุฉุกเฉิน"
    },
    asset: {
        food: "อาหาร",
        item: "รายการ",
        license: "หมายเลข",
        distance: "ระยะทาง",
        amount: "จำนวน"
    },
    dashboard: {
        cctvAlert: "จะนำไปหน้าดูกล้องวงจรปิด:",
        eventAlert: "ตรวจสอบเหตุการณ์:"
    }
}

th.emergencyReportManagement = {
    title: "จัดการรายงานเหตุฉุกเฉิน",
    subtitle: "ติดตามและจัดการรายงานเหตุฉุกเฉินจากเจ้าของยานพาหนะแบบเรียลไทม์",
    stats: {
        new: "ใหม่",
        newHint: "รอรับเรื่อง",
        inProgress: "กำลังดำเนินการ",
        inProgressHint: "มีผู้รับผิดชอบแล้ว",
        resolved: "แก้ไขแล้ว",
        resolvedHint: "ดำเนินการเสร็จสิ้น",
        closed: "ปิดเคส",
        closedHint: "ปิดเคสแล้ว",
        overSla: "เกิน SLA",
        overSlaHint: "ยังไม่มีผู้รับเรื่องเกินเวลาที่กำหนด"
    },
    filters: {
        searchPlaceholder: "ค้นหาทะเบียนรถหรือชื่อเจ้าของ...",
        allStatuses: "ทุกสถานะ",
        allTypes: "ทุกประเภท"
    },
    list: {
        title: "รายการเคส",
        caseId: "รหัสเคส",
        time: "เวลา",
        licensePlate: "ทะเบียน",
        type: "ประเภท",
        status: "สถานะ",
        assignee: "ผู้รับผิดชอบ",
        unassigned: "— ยังไม่มีคนรับ —",
        noData: "ไม่พบข้อมูล"
    },
    details: {
        reportedAt: "แจ้งเมื่อ:",
        vehicle: "รถยนต์",
        owner: "เจ้าของ",
        sharedQueueTitle: "Shared Queue",
        sharedQueueDesc: "ยังไม่มีผู้รับผิดชอบ — เคสนี้แสดงให้ admin ทุกคนเห็นพร้อมกัน",
        assignee: "ผู้รับผิดชอบเคส:",
        description: "รายละเอียดจากผู้แจ้ง",
        noDescription: "ไม่มีรายละเอียดเพิ่มเติมจากผู้แจ้ง",
        lastLocation: "ตำแหน่งล่าสุดของรถ",
        passedAt: "ผ่านเมื่อ",
        noLocation: "ไม่พบข้อมูลตำแหน่งล่าสุด",
        attachments: "ไฟล์แนบ",
        noAttachments: "ไม่มีไฟล์แนบ (แอปเวอร์ชันนี้ยังไม่รองรับการอัปโหลดภาพ/วิดีโอ)",
        relatedCases: "เคสที่เกี่ยวข้อง/ซ้ำกัน",
        noRelatedCases: "ไม่พบเคสที่เกี่ยวข้อง",
        activityLog: "ประวัติการดำเนินการ (Activity Log)",
        sendUpdate: "ส่งอัปเดตกลับเจ้าของรถ",
        internalNotes: "หมายเหตุภายใน",
        canChangeStatusAfterAccept: "เปลี่ยนสถานะได้หลัง Accept แล้วเท่านั้น",
        selectCaseToView: "กรุณาเลือกเคสจากรายการด้านซ้ายเพื่อดูรายละเอียด",
        logSubmitted: "ผู้ใช้ส่งรายงานแจ้งเหตุ",
        logAccepted: "แอดมิน {admin} รับเรื่องแล้ว",
        logResolved: "ดำเนินการแก้ไขสถานะเป็น RESOLVED",
        logClosed: "เคสถูกปิดแล้ว",
        promptLinkCase: "กรุณาระบุ Case ID ที่ต้องการเชื่อมโยง:"
    },
    actions: {
        accept: "✓ Accept",
        linkCase: "+ เชื่อมเคสอื่น",
        typeMessage: "พิมพ์ข้อความ...",
        send: "ส่ง",
        typeNotes: "บันทึกการตรวจสอบของ admin...",
        exportPrint: "Export / พิมพ์",
        changeStatus: "เปลี่ยนสถานะ:"
    }
}

th.vehicleVerification = {
    title: "ตรวจสอบและอนุมัติยานพาหนะ",
    imageLoadError: "ไม่สามารถโหลดรูปภาพเอกสารหลักฐานได้",
    verificationDataTitle: "ข้อมูลสำหรับการตรวจสอบ",
    vehicleInfo: "ข้อมูลยานพาหนะ",
    licensePlate: "ทะเบียนรถ",
    licensePlateTooltip: "โปรดตรวจสอบทะเบียนรถให้ตรงกับเอกสารอย่างละเอียด",
    province: "จังหวัด",
    color: "สีรถ",
    brandModel: "ยี่ห้อ / รุ่น",
    ownerInfo: "ข้อมูลเจ้าของบัญชี",
    fullName: "ชื่อ-นามสกุล",
    ownerTooltip: "โปรดตรวจสอบชื่อเจ้าของให้ตรงกับเอกสารอย่างละเอียด",
    phone: "เบอร์โทรศัพท์ติดต่อ",
    rejectReasonTitle: "สาเหตุการปฏิเสธคำขอ",
    rejectReasonDesc: "กรุณาระบุสาเหตุที่ปฏิเสธ เพื่อแจ้งให้ผู้ใช้งานทราบและทำการแก้ไขเอกสารใหม่ให้ถูกต้อง",
    selectRejectReason: "สาเหตุที่พบ (เลือกได้มากกว่า 1 ข้อ)",
    additionalNote: "ข้อความเพิ่มเติมถึงผู้ใช้งาน (ถ้ามี)",
    additionalNotePlaceholder: "พิมพ์ข้อความแนะนำ หรือเหตุผลเพิ่มเติม...",
    closeWindow: "ปิดหน้าต่าง",
    rejectDoc: "ปฏิเสธเอกสาร",
    approveDoc: "อนุมัติข้อมูลถูกต้อง",
    back: "ย้อนกลับ",
    confirmReject: "ยืนยันการปฏิเสธ",
    reasons: {
        unclear: "ภาพหลักฐานไม่ชัดเจน หรืออ่านข้อมูลไม่ได้",
        mismatchPlate: "ข้อมูลทะเบียนรถในเอกสารไม่ตรงกับที่ระบุ",
        incorrectImage: "รูปภาพไม่ถูกต้อง"
    }
}

export default th
