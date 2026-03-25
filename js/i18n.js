(function() {
  const I18N_STORAGE_KEY = 'rxscan.language';
  const dictionaries = {
    en: {
      'app.name': 'RxScan',
      'auth.hud.mesh': 'AI inventory mesh',
      'auth.hud.barcode': 'Barcode recognition online',
      'auth.hud.molecule': 'Molecule graph synced',
      'auth.hud.shelf': 'Shelf intelligence active',
      'auth.brand.tag': 'Pharmacy Inventory',
      'auth.kicker': 'Shared Inventory Cloud',
      'auth.subtitle': 'Sign in to access shared inventory.',
      'auth.email': 'Email',
      'auth.email.placeholder': 'staff@yourpharmacy.com',
      'auth.password': 'Password',
      'auth.password.placeholder': 'Enter password',
      'auth.signin': 'Sign In',
      'auth.signingIn': 'Signing in...',
      'auth.createStaff': 'Create Staff Account',
      'auth.creating': 'Creating...',
      'nav.dashboard': 'Dashboard',
      'nav.inventory': 'Inventory',
      'nav.map': 'Store Map',
      'nav.alerts': 'Alerts',
      'nav.analytics': 'Analytics',
      'nav.dashboard.short': 'Dash',
      'nav.inventory.short': 'Stock',
      'nav.scan.short': 'Scan',
      'nav.map.short': 'Map',
      'nav.analytics.short': 'Stats',
      'nav.scan': 'SCAN BARCODE',
      'common.or': 'OR',
      'common.signout': 'Sign out',
      'common.staff': 'Staff',
      'common.signedOut': 'Signed out',
      'connection.online': 'Online',
      'connection.offline': 'Offline',
      'connection.connecting': 'Connecting...',
      'common.add': 'Add',
      'common.edit': 'Edit',
      'common.map': 'Map',
      'common.assign': 'Assign',
      'common.scan': 'Scan',
      'common.save': 'Save',
      'common.saved': 'Saved!',
      'common.cancel': 'Cancel',
      'common.close': 'Close',
      'common.delete': 'Delete',
      'common.items': 'items',
      'inventory.add': 'Add Medicine',
      'inventory.title': 'Inventory',
      'inventory.titleAccent': 'Management',
      'inventory.subtitle': 'Full medicine stock control',
      'inventory.filter.allCategories': 'All Categories',
      'inventory.filter.allZones': 'All Zones',
      'inventory.search.placeholder': 'Search name, barcode, shelf, manufacturer...',
      'inventory.table.medicine': 'Medicine',
      'inventory.table.barcode': 'Barcode',
      'inventory.table.location': 'Location',
      'inventory.table.stock': 'Stock',
      'inventory.table.boxPrice': 'Box Price',
      'inventory.table.unitPrice': 'Unit Price',
      'inventory.table.expiry': 'Expiry',
      'inventory.table.actions': 'Actions',
      'inventory.pageInfo': '{{total}} results — page {{current}} of {{pages}}{{filter}}',
      'inventory.unit.box': 'box',
      'inventory.unit.boxes': 'boxes',
      'inventory.unit.unit': 'unit',
      'inventory.export': 'Export CSV',
      'inventory.quick.all': 'All',
      'inventory.quick.low': 'Low',
      'inventory.quick.out': 'Out',
      'inventory.quick.expired': 'Expired',
      'inventory.quick.expiring': 'Expiring',
      'inventory.summary.all': 'All Inventory',
      'inventory.summary.shown': '{{count}} shown',
      'inventory.summary.low': 'Low Stock',
      'inventory.summary.lowNote': 'Needs reorder attention',
      'inventory.summary.out': 'Out of Stock',
      'inventory.summary.outNote': 'Unavailable now',
      'inventory.summary.expired': 'Expired',
      'inventory.summary.expiredNote': 'Remove from shelves',
      'inventory.summary.expiring': 'Expiring Soon',
      'inventory.summary.expiringNote': 'Within 90 days',
      'inventory.status.ok': 'In Stock',
      'inventory.status.in': 'In Stock',
      'inventory.status.low': 'Low',
      'inventory.status.out': 'Out of Stock',
      'inventory.expiry.none': 'No expiry',
      'inventory.expiry.expired': 'Expired',
      'inventory.expiry.daysLeft': '{{count}}d left',
      'inventory.empty.title': 'No results',
      'inventory.empty.copy': 'Try adjusting your filters',
      'dashboard.recentScans': 'Recent Scans',
      'dashboard.last24h': 'Last 24h',
      'dashboard.stockByCategory': 'Stock by Category',
      'dashboard.stat.totalSkus': 'Total SKUs',
      'dashboard.stat.totalSkus.sub': 'Unique medicines',
      'dashboard.stat.totalValue': 'Total Value',
      'dashboard.stat.totalValue.sub': 'Inventory valuation',
      'dashboard.stat.lowStock': 'Low Stock',
      'dashboard.stat.lowStock.sub': 'Below reorder point',
      'dashboard.stat.expiringSoon': 'Expiring Soon',
      'dashboard.stat.expiringSoon.sub': 'Within 90 days',
      'category.analgesics': 'Analgesics',
      'category.vitamins_supplements': 'Vitamins & Supplements',
      'category.respiratory': 'Respiratory',
      'category.cardiovascular': 'Cardiovascular',
      'category.gastrointestinal': 'Gastrointestinal',
      'category.antibiotics': 'Antibiotics',
      'category.hormones': 'Hormones',
      'category.dermatology': 'Dermatology',
      'category.diabetes': 'Diabetes',
      'category.neurology': 'Neurology',
      'category.other': 'Other',
      'scanner.title': 'Scan Medicine',
      'scanner.subtitle': 'Scan Data Matrix or barcode',
      'scanner.desktopSubtitle': 'Scan Data Matrix or barcode - or enter manually',
      'scanner.addNewMedicine': 'Add New Medicine',
      'scanner.manualPlaceholder': 'Enter barcode manually...',
      'scanner.lookup': 'Look up',
      'scanner.result.unknown': 'Unknown',
      'scanner.result.stockBoxes': '{{count}} boxes',
      'scanner.result.dataMatrixFmd': 'DataMatrix/FMD',
      'scanner.status.ready': 'Ready - point camera at barcode',
      'scanner.status.captured': 'Captured: {{code}}',
      'scanner.status.confirming': 'Confirming...',
      'scanner.status.compatibility': 'Trying compatibility scan...',
      'scanner.status.startingCamera': 'Starting camera...',
      'scanner.status.pointCamera': 'Point camera at barcode',
      'scanner.status.compatibilityActive': 'Compatibility scan active',
      'scanner.status.errorManual': 'Scanner error -- use manual input',
      'scanner.status.permissionDenied': 'Camera permission denied - type barcode below',
      'scanner.status.noCamera': 'No camera found - type barcode below',
      'scanner.status.cameraUnavailable': 'Camera unavailable -- use manual input below',
      'scanner.status.dataMatrixLoading': 'DataMatrix decoded - loading name...',
      'scanner.status.newBarcode': 'New barcode - opening form...',
      'scanner.status.found': 'Found: {{name}}',
      'scanner.status.foundSource': '{{region}} Found: {{name}} - {{source}}',
      'scanner.status.dataMatrixOffline': 'DataMatrix decoded - offline',
      'scanner.status.offlineManual': 'Offline - fill manually',
      'scanner.status.dataMatrixNoName': 'DataMatrix decoded - name not found',
      'scanner.status.notFoundGlobal': 'Not found globally - add manually',
      'scanner.status.dataMatrixDecoded': 'DataMatrix decoded',
      'scanner.status.lookupFailed': 'Lookup failed - add manually',
      'scanner.toast.stockUpdated': 'Stock updated to {{count}} boxes',
      'scanner.toast.unableUpdateStock': 'Unable to update stock',
      'dashboard.greeting.morning': 'Good morning',
      'dashboard.greeting.afternoon': 'Good afternoon',
      'dashboard.greeting.evening': 'Good evening',
      'dashboard.attention.noun.single': 'medicine',
      'dashboard.attention.noun.plural': 'medicines',
      'dashboard.attention.summary': '{{count}} {{noun}} need attention',
      'dashboard.attention.low': '{{count}} low stock',
      'dashboard.attention.expiring': '{{count}} expiring within 90 days',
      'dashboard.attention.review': 'Review alerts',
      'dashboard.attention.clear': 'All inventory signals look healthy today',
      'dashboard.recentScans.empty': 'No scans yet - use the SCAN button to begin',
      'dashboard.recentScans.emptyAction': 'Scan',
      'map.title': 'Store',
      'map.titleAccent': 'Map',
      'map.subtitle': 'Visual layout - click a shelf to see its contents',
      'map.zones': 'Zones',
      'map.search.placeholder': 'Find shelf e.g. A2-L1',
      'map.search.jump': 'Jump',
      'map.selectedShelf': 'Selected Shelf',
      'map.empty.title': 'Select a shelf',
      'map.empty.copy': 'Inspect stock, expiry, and assigned medicines from the map.',
      'alerts.title': 'Smart',
      'alerts.titleAccent': 'Alerts',
      'alerts.subtitle': 'Automated inventory intelligence',
      'alerts.info.noExpiry': 'No expiry',
      'alerts.kicker.expired': 'Expired',
      'alerts.kicker.out': 'Out of stock',
      'alerts.kicker.low': 'Low stock',
      'alerts.kicker.expiring': 'Expiring soon',
      'alerts.kicker.default': 'Alert',
      'alerts.meter.reorder': 'Reorder {{count}}',
      'alerts.meter.boxes': '{{count}} boxes',
      'alerts.meter.daysLeft': '{{count}}d left',
      'alerts.group.critical': 'Critical',
      'alerts.group.warning': 'Needs reorder',
      'alerts.group.expiring': 'Expiring soon',
      'alerts.filter.all': 'All',
      'alerts.filter.low': 'Low',
      'alerts.filter.out': 'Out',
      'alerts.filter.expiring': 'Expiring',
      'alerts.empty.title': 'All clear',
      'alerts.empty.filter': 'No alerts in this filter right now.',
      'alerts.empty.none': 'No active alerts at this time.',
      'analytics.title': 'Analytics',
      'analytics.titleAccent': '& Reports',
      'analytics.subtitle': 'Inventory trends and financial overview',
      'analytics.insight.inStockRate': 'In stock rate',
      'analytics.insight.inStockRate.meta': 'Above reorder point',
      'analytics.insight.nearestExpiry': 'Nearest expiry',
      'analytics.insight.nearestExpiry.meta': 'No upcoming expiry',
      'analytics.insight.highestPricedBox': 'Highest priced box',
      'analytics.insight.highestPricedBox.meta': 'No inventory yet',
      'analytics.insight.categories': 'Categories',
      'analytics.insight.categories.meta': 'Drug categories',
      'analytics.stats.totalUnits': 'Total Units',
      'analytics.stats.totalUnits.sub': 'Across all products',
      'analytics.stats.avgBoxPrice': 'Avg Box Price',
      'analytics.stats.avgBoxPrice.sub': 'Across all medicines',
      'analytics.chart.topStock': 'Top stock',
      'analytics.chart.topStock.meta': 'highest quantity',
      'analytics.chart.topValue': 'Top value',
      'analytics.chart.topValue.meta': 'inventory worth',
      'analytics.chart.categoryMix': 'Category mix',
      'analytics.chart.categoryMix.meta': 'medicine count',
      'modal.medication.title': 'Add Medicine',
      'modal.medication.editTitle': 'Edit Medicine',
      'modal.medication.validation.required': 'Please fill in all required fields',
      'modal.medication.toast.updated': 'Medicine updated',
      'modal.medication.toast.added': 'Medicine added',
      'modal.medication.toast.unableSave': 'Unable to save medicine',
      'modal.medication.status.stockOk': 'Stock OK',
      'modal.medication.status.noExpiry': 'No expiry',
      'modal.medication.status.unassigned': 'Unassigned',
      'modal.medication.field.brand': 'Brand Name *',
      'modal.medication.field.generic': 'Generic Name',
      'modal.medication.field.barcode': 'Barcode *',
      'modal.medication.field.category': 'Category *',
      'modal.medication.field.boxPrice': 'Box Price ($) *',
      'modal.medication.field.unitsPerBox': 'Units per Box',
      'modal.medication.field.currentStock': 'Current Stock (boxes)',
      'modal.medication.field.reorderPoint': 'Reorder Point',
      'modal.medication.field.zone': 'Zone *',
      'modal.medication.field.shelf': 'Shelf',
      'modal.medication.field.expiryDate': 'Expiry Date',
      'modal.medication.field.manufacturer': 'Manufacturer',
      'modal.medication.placeholder.brand': 'e.g. Amoxil',
      'modal.medication.placeholder.generic': 'e.g. Amoxicillin',
      'modal.medication.placeholder.barcode': 'e.g. 3400936345507',
      'modal.medication.placeholder.shelf': 'e.g. A2-L3',
      'modal.medication.placeholder.manufacturer': 'e.g. Pfizer',
      'modal.confirm.deleteTitle': 'Delete medicine?',
      'modal.confirm.deleteMessage': 'Remove {{name}} from inventory? This cannot be undone.',
      'modal.confirm.deleted': 'Medicine removed',
      'modal.confirm.unableDelete': 'Unable to delete medicine',
      'modal.stock.title': 'Update stock',
      'modal.stock.newStock': 'New stock',
      'modal.stock.unitBoxes': 'boxes',
      'modal.stock.error.enterValue': 'Enter a stock value.',
      'modal.stock.error.wholeNumber': 'Stock must be a whole number.',
      'modal.stock.toast.updatedFor': 'Stock updated for {{name}}',
      'modal.stock.toast.unableUpdate': 'Unable to update stock',
      'modal.detail.title': 'Medicine',
      'modal.detail.status.inStock': 'In stock',
      'modal.detail.status.noExpiry': 'No expiry',
      'modal.detail.status.assigned': 'Assigned',
      'modal.detail.status.unknown': 'Unknown',
      'modal.detail.status.uncategorized': 'Uncategorized',
      'modal.detail.section.status': 'Status',
      'modal.detail.section.pricing': 'Pricing',
      'modal.detail.section.productInfo': 'Product info',
      'modal.detail.field.currentStock': 'Current stock',
      'modal.detail.field.expiry': 'Expiry',
      'modal.detail.field.boxPrice': 'Box price',
      'modal.detail.field.unitPrice': 'Unit price',
      'modal.detail.field.barcode': 'Barcode',
      'modal.detail.field.supplier': 'Supplier',
      'modal.detail.field.category': 'Category',
      'modal.detail.field.shelf': 'Shelf',
      'modal.detail.expiry.noDate': 'No expiry date recorded',
      'modal.detail.stockBoxes': '{{count}} {{unit}}',
      'modal.detail.reorderAt': 'Reorder at {{count}} {{unit}}',
      'modal.detail.action.updateStock': 'Update stock',
      'modal.detail.action.editMedicine': 'Edit medicine',
      'modal.detail.action.locateOnMap': 'Locate on map',
      'modal.detail.action.deleteMedicine': 'Delete medicine',
      'modal.detail.action.assignShelf': 'Assign shelf',
      'modal.filterExport.title': 'Filter & Export',
      'modal.filterExport.subtitle': 'Refine the list or export what you need',
      'modal.filterExport.clearAll': 'Clear all filters',
      'map.detail.selectedShelf': 'Selected shelf',
      'map.detail.noMedicines': 'No medicines assigned yet.',
      'map.detail.medicine.single': '1 medicine',
      'map.detail.medicine.plural': '{{count}} medicines',
      'map.detail.noGeneric': 'No generic name',
      'map.detail.priceLine': '${{box}} box - ${{unit}} unit',
      'map.detail.stockBoxes': '{{count}} box{{suffix}}',
      'map.detail.prompt.title': 'Select a shelf',
      'map.detail.prompt.copy': 'Choose a shelf in {{zone}} to inspect stock, prices, expiry, and assigned medicines.',
      'map.section.zone': 'Zone {{zones}}',
      'map.section.medicines': '{{count}} medicines',
      'map.section.low': '{{count}} low',
      'map.section.problem': '{{count}} problem',
      'map.counter': 'Dispensing Counter',
      'map.legend.all': 'All',
      'map.legend.healthy': 'Healthy',
      'map.legend.warning': 'Low stock',
      'map.legend.critical': 'Problem',
      'map.filter.summary': 'Zone {{id}} - {{label}}',
      'map.filter.back': 'Back to all zones',
      'map.shelf.item': 'item',
      'map.shelf.items': 'items',
      'map.shelf.empty': 'empty',
      'map.search.notFound': 'Shelf {{shelf}} not found',
      'map.mobile.tapShelf': 'Tap a shelf to view its medicines.',
      'analytics.value.noInventory': 'No inventory yet',
      'analytics.value.addMedicines': 'Add medicines to see leaders',
      'analytics.expiry.allClear': 'All clear',
      'analytics.expiry.none': 'No upcoming expiry',
      'analytics.health.noData': 'No data',
      'analytics.health.noDataMeta': 'Add medicines to see stock coverage',
      'analytics.health.meta': '{{healthy}} of {{total}} medicines above reorder point',
      'analytics.daysLeft': '{{count}}d left - {{date}}',
    },
    km: {
      'app.name': 'RxScan',
      'auth.hud.mesh': 'បណ្ដាញ AI សម្រាប់ស្តុកថ្នាំ',
      'auth.hud.barcode': 'ការស្គាល់បារកូដកំពុងដំណើរការ',
      'auth.hud.molecule': 'ក្រាហ្វម៉ូលេគុលត្រូវបានសមកាលកម្ម',
      'auth.hud.shelf': 'ប្រព័ន្ធឆ្លាតវៃធ្នើកំពុងដំណើរការ',
      'auth.brand.tag': 'គ្រប់គ្រងស្តុកឱសថស្ថាន',
      'auth.kicker': 'ប្រព័ន្ធស្តុករួមលើក្លាវ',
      'auth.subtitle': 'ចូលប្រើប្រាស់ស្តុករួមរបស់អ្នក',
      'auth.email': 'អ៊ីមែល',
      'auth.email.placeholder': 'staff@yourpharmacy.com',
      'auth.password': 'ពាក្យសម្ងាត់',
      'auth.password.placeholder': 'បញ្ចូលពាក្យសម្ងាត់',
      'auth.signin': 'ចូលប្រើ',
      'auth.createStaff': 'បង្កើតគណនីបុគ្គលិក',
      'nav.dashboard': 'ផ្ទាំងសង្ខេប',
      'nav.inventory': 'ស្តុក',
      'nav.map': 'ផែនទីហាង',
      'nav.alerts': 'ការជូនដំណឹង',
      'nav.analytics': 'វិភាគ',
      'nav.dashboard.short': 'សង្ខេប',
      'nav.inventory.short': 'ស្តុក',
      'nav.scan.short': 'ស្កេន',
      'nav.map.short': 'ផែនទី',
      'nav.analytics.short': 'ស្ថិតិ',
      'nav.scan': 'ស្កេនបារកូដ',
      'common.or': 'ឬ',
      'common.signout': 'ចាកចេញ',
      'common.add': 'បន្ថែម',
      'common.scan': 'ស្កេន',
      'common.save': 'រក្សាទុក',
      'common.saved': 'បានរក្សាទុក!',
      'common.cancel': 'បោះបង់',
      'common.close': 'បិទ',
      'common.delete': 'លុប',
      'common.items': 'មុខទំនិញ',
      'inventory.add': 'បន្ថែមថ្នាំ',
      'inventory.title': 'គ្រប់គ្រង',
      'inventory.titleAccent': 'ស្តុក',
      'inventory.subtitle': 'គ្រប់គ្រងស្តុកថ្នាំទាំងមូល',
      'inventory.filter.allCategories': 'គ្រប់ប្រភេទ',
      'inventory.filter.allZones': 'គ្រប់តំបន់',
      'inventory.export': 'នាំចេញ CSV',
      'inventory.quick.all': 'ទាំងអស់',
      'inventory.quick.low': 'ទាប',
      'inventory.quick.out': 'អស់',
      'inventory.quick.expired': 'ផុត',
      'inventory.quick.expiring': 'ជិតផុត',
      'inventory.summary.all': 'ស្តុកទាំងអស់',
      'inventory.summary.shown': 'បង្ហាញ {{count}}',
      'inventory.summary.low': 'ស្តុកទាប',
      'inventory.summary.lowNote': 'ត្រូវការបញ្ជាទិញបន្ថែម',
      'inventory.summary.out': 'អស់ពីស្តុក',
      'inventory.summary.outNote': 'មិនមានឥឡូវនេះ',
      'inventory.summary.expired': 'ផុតកំណត់',
      'inventory.summary.expiredNote': 'ត្រូវយកចេញពីធ្នើ',
      'inventory.summary.expiring': 'ជិតផុតកំណត់',
      'inventory.summary.expiringNote': 'ក្នុងរយៈពេល 90 ថ្ងៃ',
      'inventory.status.ok': 'មានស្តុក',
      'inventory.status.in': 'មានស្តុក',
      'inventory.status.low': 'ស្តុកទាប',
      'inventory.status.out': 'អស់ពីស្តុក',
      'inventory.expiry.none': 'គ្មានកាលបរិច្ឆេទផុតកំណត់',
      'inventory.expiry.expired': 'ផុតកំណត់',
      'inventory.expiry.daysLeft': 'នៅសល់ {{count}} ថ្ងៃ',
      'inventory.empty.title': 'មិនមានលទ្ធផល',
      'inventory.empty.copy': 'សាកល្បងកែប្រែតម្រងរបស់អ្នក',
      'dashboard.recentScans': 'ស្កេនថ្មីៗ',
      'dashboard.last24h': '24 ម៉ោងចុងក្រោយ',
      'dashboard.stockByCategory': 'ស្តុកតាមប្រភេទ',
      'dashboard.stat.totalSkus': 'សរុបមុខថ្នាំ',
      'dashboard.stat.totalSkus.sub': 'ថ្នាំខុសៗគ្នា',
      'dashboard.stat.totalValue': 'តម្លៃសរុប',
      'dashboard.stat.totalValue.sub': 'តម្លៃស្តុកសរុប',
      'dashboard.stat.lowStock': 'ស្តុកទាប',
      'dashboard.stat.lowStock.sub': 'ក្រោមចំណុចបញ្ជាទិញ',
      'dashboard.stat.expiringSoon': 'ជិតផុតកំណត់',
      'dashboard.stat.expiringSoon.sub': 'ក្នុងរយៈពេល 90 ថ្ងៃ',
      'category.analgesics': 'បំបាត់ការឈឺចាប់',
      'category.vitamins_supplements': 'វីតាមីន និងអាហារបំប៉ន',
      'category.respiratory': 'ផ្លូវដង្ហើម',
      'category.cardiovascular': 'សរសៃឈាមបេះដូង',
      'category.gastrointestinal': 'ក្រពះ និងពោះវៀន',
      'category.antibiotics': 'អង់ទីប៊ីយ៉ូទិច',
      'category.hormones': 'អ័រម៉ូន',
      'category.dermatology': 'សើស្បែក',
      'category.diabetes': 'ទឹកនោមផ្អែម',
      'category.neurology': 'ប្រព័ន្ធប្រសាទ',
      'category.other': 'ផ្សេងៗ',
      'scanner.title': 'ស្កេនថ្នាំ',
      'scanner.subtitle': 'ស្កេន Data Matrix ឬបារកូដ',
      'scanner.desktopSubtitle': 'ស្កេន Data Matrix ឬបារកូដ ឬបញ្ចូលដោយដៃ',
      'scanner.addNewMedicine': 'បន្ថែមថ្នាំថ្មី',
      'scanner.manualPlaceholder': 'បញ្ចូលកូដដោយដៃ...',
      'scanner.lookup': 'ស្វែងរក',
      'scanner.result.unknown': 'មិនស្គាល់',
      'scanner.result.stockBoxes': '{{count}} ប្រអប់',
      'scanner.result.dataMatrixFmd': 'DataMatrix/FMD',
      'scanner.status.ready': 'រួចរាល់ - ដាក់កាមេរ៉ាទៅលើកូដ',
      'scanner.status.captured': 'បានចាប់យក៖ {{code}}',
      'scanner.status.confirming': 'កំពុងផ្ទៀងផ្ទាត់...',
      'scanner.status.compatibility': 'កំពុងព្យាយាមមុខងារជំនួស...',
      'scanner.status.startingCamera': 'កំពុងបើកកាមេរ៉ា...',
      'scanner.status.pointCamera': 'ដាក់កាមេរ៉ាទៅលើកូដ',
      'scanner.status.compatibilityActive': 'មុខងារជំនួសកំពុងដំណើរការ',
      'scanner.status.errorManual': 'មានបញ្ហាស្កេន -- សូមបញ្ចូលដោយដៃ',
      'scanner.status.permissionDenied': 'មិនអនុញ្ញាតកាមេរ៉ា - សូមវាយបារកូដខាងក្រោម',
      'scanner.status.noCamera': 'រកមិនឃើញកាមេរ៉ា - សូមវាយបារកូដខាងក្រោម',
      'scanner.status.cameraUnavailable': 'កាមេរ៉ាមិនអាចប្រើបាន -- សូមបញ្ចូលខាងក្រោម',
      'scanner.status.dataMatrixLoading': 'បានអាន Data Matrix - កំពុងស្វែងរកឈ្មោះ...',
      'scanner.status.newBarcode': 'បារកូដថ្មី - កំពុងបើកទម្រង់...',
      'scanner.status.found': 'បានរកឃើញ៖ {{name}}',
      'scanner.status.foundSource': '{{region}} បានរកឃើញ៖ {{name}} - {{source}}',
      'scanner.status.dataMatrixOffline': 'បានអាន Data Matrix - កំពុងក្រៅបណ្តាញ',
      'scanner.status.offlineManual': 'ក្រៅបណ្តាញ - សូមបំពេញដោយដៃ',
      'scanner.status.dataMatrixNoName': 'បានអាន Data Matrix - រកមិនឃើញឈ្មោះ',
      'scanner.status.notFoundGlobal': 'រកមិនឃើញសកល - បន្ថែមដោយដៃ',
      'scanner.status.dataMatrixDecoded': 'បានអាន Data Matrix',
      'scanner.status.lookupFailed': 'ស្វែងរកបរាជ័យ - បន្ថែមដោយដៃ',
      'scanner.toast.stockUpdated': 'បានធ្វើបច្ចុប្បន្នភាពស្តុកជា {{count}} ប្រអប់',
      'scanner.toast.unableUpdateStock': 'មិនអាចធ្វើបច្ចុប្បន្នភាពស្តុកបាន',
      'dashboard.greeting.morning': 'អរុណសួស្តី',
      'dashboard.greeting.afternoon': 'ទិវាសួស្តី',
      'dashboard.greeting.evening': 'សាយ័ន្តសួស្តី',
      'dashboard.attention.noun.single': 'ថ្នាំ',
      'dashboard.attention.noun.plural': 'ថ្នាំ',
      'dashboard.attention.summary': 'មាន {{count}} {{noun}} ត្រូវពិនិត្យជាបន្ទាន់',
      'dashboard.attention.low': '{{count}} ស្តុកទាប',
      'dashboard.attention.expiring': '{{count}} ជិតផុតកំណត់ក្នុង 90 ថ្ងៃ',
      'dashboard.attention.review': 'មើលការជូនដំណឹង',
      'dashboard.attention.clear': 'សញ្ញាស្តុកទាំងអស់ស្ថិតក្នុងស្ថានភាពល្អ',
      'dashboard.recentScans.empty': 'មិនទាន់មានការស្កេនទេ - ប្រើប៊ូតុង SCAN ដើម្បីចាប់ផ្តើម',
      'dashboard.recentScans.emptyAction': 'ស្កេន',
      'map.title': 'ផែនទី',
      'map.titleAccent': 'ហាង',
      'map.subtitle': 'ប្លង់មើលឃើញ - ចុចធ្នើដើម្បីមើលមាតិកា',
      'map.zones': 'តំបន់',
      'map.search.placeholder': 'ស្វែងរកធ្នើ ឧ. A2-L1',
      'map.search.jump': 'ទៅ',
      'map.selectedShelf': 'ធ្នើដែលបានជ្រើស',
      'map.empty.title': 'ជ្រើសធ្នើមួយ',
      'map.empty.copy': 'ពិនិត្យស្តុក កាលបរិច្ឆេទផុតកំណត់ និងថ្នាំដែលបានដាក់លើផែនទី',
      'alerts.title': 'ការជូន',
      'alerts.titleAccent': 'ដំណឹង',
      'alerts.subtitle': 'ប្រព័ន្ធឆ្លាតវៃសម្រាប់តាមដានស្តុក',
      'alerts.info.noExpiry': 'គ្មានកាលបរិច្ឆេទផុតកំណត់',
      'alerts.kicker.expired': 'ផុតកំណត់',
      'alerts.kicker.out': 'អស់ពីស្តុក',
      'alerts.kicker.low': 'ស្តុកទាប',
      'alerts.kicker.expiring': 'ជិតផុតកំណត់',
      'alerts.kicker.default': 'ការជូនដំណឹង',
      'alerts.meter.reorder': 'ត្រូវបញ្ជាទិញ {{count}}',
      'alerts.meter.boxes': '{{count}} ប្រអប់',
      'alerts.meter.daysLeft': 'នៅសល់ {{count}} ថ្ងៃ',
      'alerts.group.critical': 'បន្ទាន់',
      'alerts.group.warning': 'ត្រូវបញ្ជាទិញ',
      'alerts.group.expiring': 'ជិតផុតកំណត់',
      'alerts.filter.all': 'ទាំងអស់',
      'alerts.filter.low': 'ស្តុកទាប',
      'alerts.filter.out': 'អស់ស្តុក',
      'alerts.filter.expiring': 'ជិតផុតកំណត់',
      'alerts.empty.title': 'គ្មានបញ្ហា',
      'alerts.empty.filter': 'មិនមានការជូនដំណឹងសម្រាប់តម្រងនេះទេ',
      'alerts.empty.none': 'មិនមានការជូនដំណឹងសកម្មនៅពេលនេះទេ',
      'analytics.title': 'វិភាគ',
      'analytics.titleAccent': '& របាយការណ៍',
      'analytics.subtitle': 'និន្នាការស្តុក និងទិដ្ឋភាពហិរញ្ញវត្ថុ',
      'analytics.insight.inStockRate': 'អត្រាមានស្តុក',
      'analytics.insight.inStockRate.meta': 'លើសចំណុចបញ្ជាទិញបន្ថែម',
      'analytics.insight.nearestExpiry': 'ផុតកំណត់ជិតបំផុត',
      'analytics.insight.nearestExpiry.meta': 'មិនមានការផុតកំណត់ជិតមកដល់',
      'analytics.insight.highestPricedBox': 'ប្រអប់មានតម្លៃខ្ពស់បំផុត',
      'analytics.insight.highestPricedBox.meta': 'មិនទាន់មានស្តុក',
      'analytics.insight.categories': 'ប្រភេទ',
      'analytics.insight.categories.meta': 'ប្រភេទថ្នាំ',
      'analytics.stats.totalUnits': 'ចំនួនសរុប',
      'analytics.stats.totalUnits.sub': 'គ្រប់ផលិតផលទាំងអស់',
      'analytics.stats.avgBoxPrice': 'តម្លៃមធ្យម/ប្រអប់',
      'analytics.stats.avgBoxPrice.sub': 'គ្រប់ថ្នាំទាំងអស់',
      'analytics.chart.topStock': 'ស្តុកខ្ពស់បំផុត',
      'analytics.chart.topStock.meta': 'បរិមាណខ្ពស់បំផុត',
      'analytics.chart.topValue': 'តម្លៃខ្ពស់បំផុត',
      'analytics.chart.topValue.meta': 'តម្លៃស្តុក',
      'analytics.chart.categoryMix': 'សមាសភាពប្រភេទ',
      'analytics.chart.categoryMix.meta': 'ប្រភេទថ្នាំ',
      'modal.medication.title': 'បន្ថែមថ្នាំ',
      'modal.medication.editTitle': 'កែប្រែថ្នាំ',
      'modal.medication.validation.required': 'សូមបំពេញវាលចាំបាច់ទាំងអស់',
      'modal.medication.toast.updated': 'បានកែប្រែថ្នាំ',
      'modal.medication.toast.added': 'បានបន្ថែមថ្នាំ',
      'modal.medication.toast.unableSave': 'មិនអាចរក្សាទុកថ្នាំបាន',
      'modal.medication.status.stockOk': 'ស្តុកល្អ',
      'modal.medication.status.noExpiry': 'គ្មានថ្ងៃផុតកំណត់',
      'modal.medication.status.unassigned': 'មិនទាន់ដាក់ទីតាំង',
      'modal.medication.field.brand': 'ឈ្មោះម៉ាក *',
      'modal.medication.field.generic': 'ឈ្មោះទូទៅ',
      'modal.medication.field.barcode': 'បារកូដ *',
      'modal.medication.field.category': 'ប្រភេទ *',
      'modal.medication.field.boxPrice': 'តម្លៃប្រអប់ ($) *',
      'modal.medication.field.unitsPerBox': 'ចំនួនឯកតា/ប្រអប់',
      'modal.medication.field.currentStock': 'ស្តុកបច្ចុប្បន្ន (ប្រអប់)',
      'modal.medication.field.reorderPoint': 'ចំណុចបញ្ជាទិញបន្ថែម',
      'modal.medication.field.zone': 'តំបន់ *',
      'modal.medication.field.shelf': 'ធ្នើ',
      'modal.medication.field.expiryDate': 'ថ្ងៃផុតកំណត់',
      'modal.medication.field.manufacturer': 'ក្រុមហ៊ុនផលិត',
      'modal.medication.placeholder.brand': 'ឧ. Amoxil',
      'modal.medication.placeholder.generic': 'ឧ. Amoxicillin',
      'modal.medication.placeholder.barcode': 'ឧ. 3400936345507',
      'modal.medication.placeholder.shelf': 'ឧ. A2-L3',
      'modal.medication.placeholder.manufacturer': 'ឧ. Pfizer',
      'modal.confirm.deleteTitle': 'លុបថ្នាំមែនទេ?',
      'modal.stock.title': 'ធ្វើបច្ចុប្បន្នភាពស្តុក',
      'modal.stock.newStock': 'ស្តុកថ្មី',
      'modal.stock.unitBoxes': 'ប្រអប់',
      'modal.stock.toast.unableUpdate': 'មិនអាចធ្វើបច្ចុប្បន្នភាពស្តុកបាន',
      'modal.detail.title': 'ថ្នាំ',
      'modal.detail.status.inStock': 'មានស្តុក',
      'modal.detail.status.noExpiry': 'គ្មានថ្ងៃផុតកំណត់',
      'modal.detail.status.assigned': 'បានដាក់ទីតាំង',
      'modal.detail.status.unknown': 'មិនស្គាល់',
      'modal.detail.status.uncategorized': 'មិនទាន់កំណត់ប្រភេទ',
      'modal.detail.section.status': 'ស្ថានភាព',
      'modal.detail.section.pricing': 'តម្លៃ',
      'modal.detail.section.productInfo': 'ព័ត៌មានផលិតផល',
      'modal.detail.field.currentStock': 'ស្តុកបច្ចុប្បន្ន',
      'modal.detail.field.expiry': 'ថ្ងៃផុតកំណត់',
      'modal.detail.field.boxPrice': 'តម្លៃប្រអប់',
      'modal.detail.field.unitPrice': 'តម្លៃឯកតា',
      'modal.detail.field.barcode': 'បារកូដ',
      'modal.detail.field.supplier': 'អ្នកផ្គត់ផ្គង់',
      'modal.detail.field.category': 'ប្រភេទ',
      'modal.detail.field.shelf': 'ធ្នើ',
      'modal.detail.expiry.noDate': 'មិនមានកាលបរិច្ឆេទផុតកំណត់',
      'modal.detail.action.updateStock': 'ធ្វើបច្ចុប្បន្នភាពស្តុក',
      'modal.detail.action.editMedicine': 'កែប្រែថ្នាំ',
      'modal.detail.action.locateOnMap': 'មើលទីតាំងលើផែនទី',
      'modal.detail.action.deleteMedicine': 'លុបថ្នាំ',
      'modal.detail.action.assignShelf': 'កំណត់ធ្នើ',
      'modal.filterExport.title': 'តម្រង & នាំចេញ',
      'modal.filterExport.subtitle': 'កែតម្រងបញ្ជី ឬនាំចេញអ្វីដែលអ្នកត្រូវការ',
      'modal.filterExport.clearAll': 'សម្អាតតម្រងទាំងអស់',
      'map.detail.selectedShelf': 'ធ្នើដែលបានជ្រើស',
      'map.detail.noMedicines': 'មិនទាន់មានថ្នាំលើធ្នើនេះទេ',
      'map.detail.medicine.single': '1 មុខថ្នាំ',
      'map.detail.medicine.plural': '{{count}} មុខថ្នាំ',
      'map.detail.noGeneric': 'គ្មានឈ្មោះទូទៅ',
      'map.detail.priceLine': '${{box}} /ប្រអប់ - ${{unit}} /ឯកតា',
      'map.detail.stockBoxes': '{{count}} ប្រអប់{{suffix}}',
      'map.detail.prompt.title': 'ជ្រើសធ្នើមួយ',
      'map.detail.prompt.copy': 'ជ្រើសធ្នើក្នុង {{zone}} ដើម្បីពិនិត្យស្តុក តម្លៃ ថ្ងៃផុតកំណត់ និងថ្នាំដែលបានដាក់',
      'map.section.zone': 'តំបន់ {{zones}}',
      'map.section.medicines': '{{count}} មុខថ្នាំ',
      'map.section.low': '{{count}} ស្តុកទាប',
      'map.section.problem': '{{count}} បញ្ហា',
      'map.counter': 'តុចែកចាយ',
      'map.legend.all': 'ទាំងអស់',
      'map.legend.healthy': 'ស្តុកល្អ',
      'map.legend.warning': 'ស្តុកទាប',
      'map.legend.critical': 'បញ្ហា',
      'map.filter.summary': 'តំបន់ {{id}} - {{label}}',
      'map.filter.back': 'ត្រឡប់ទៅតំបន់ទាំងអស់',
      'map.shelf.item': 'មុខ',
      'map.shelf.items': 'មុខ',
      'map.shelf.empty': 'ទទេ',
      'map.search.notFound': 'រកមិនឃើញធ្នើ {{shelf}}',
      'map.mobile.tapShelf': 'ចុចលើធ្នើដើម្បីមើលថ្នាំ',
      'analytics.value.noInventory': 'មិនទាន់មានស្តុក',
      'analytics.value.addMedicines': 'បន្ថែមថ្នាំដើម្បីមើលលទ្ធផលកំពូល',
      'analytics.expiry.allClear': 'គ្មានបញ្ហា',
      'analytics.expiry.none': 'មិនមានការផុតកំណត់ជិតមកដល់',
      'analytics.health.noData': 'គ្មានទិន្នន័យ',
      'analytics.health.noDataMeta': 'បន្ថែមថ្នាំដើម្បីមើលភាពគ្រប់គ្រងស្តុក',
      'analytics.health.meta': '{{healthy}} / {{total}} មុខលើសចំណុចបញ្ជាទិញបន្ថែម',
      'analytics.daysLeft': 'នៅសល់ {{count}} ថ្ងៃ - {{date}}',
    },
  };

  Object.assign(dictionaries.km || (dictionaries.km = {}), {
    'auth.signin': 'ចូលប្រើ',
    'auth.createStaff': 'បង្កើតគណនីបុគ្គលិក',
    'auth.creating': 'កំពុងបង្កើត...',
    'common.signout': 'ចាកចេញ',
    'common.staff': 'បុគ្គលិក',
    'common.signedOut': 'មិនទាន់ចូល',
    'common.add': 'បន្ថែម',
    'connection.online': 'អនឡាញ',
    'connection.offline': 'ក្រៅបណ្តាញ',
    'connection.connecting': 'កំពុងភ្ជាប់...',
    'dashboard.recentScans.empty': 'មិនទាន់មានការស្កេនទេ — ប្រើប៊ូតុង SCAN ដើម្បីចាប់ផ្តើម',
    'dashboard.recentScans.emptyAction': 'ស្កេន',
    'category.analgesics': 'បំបាត់ការឈឺចាប់',
    'category.vitamins_supplements': 'វីតាមីន និងអាហារបំប៉ន',
    'category.respiratory': 'ផ្លូវដង្ហើម',
    'category.cardiovascular': 'សរសៃឈាមបេះដូង',
    'category.gastrointestinal': 'ក្រពះ និងពោះវៀន',
    'category.antibiotics': 'អង់ទីប៊ីយ៉ូទិច',
    'category.hormones': 'អ័រម៉ូន',
    'category.dermatology': 'សើស្បែក',
    'category.diabetes': 'ទឹកនោមផ្អែម',
    'category.neurology': 'ប្រព័ន្ធប្រសាទ',
    'category.other': 'ផ្សេងៗ',
  });

  Object.assign(dictionaries.km || (dictionaries.km = {}), {
    'auth.signingIn': 'កំពុងចូល...'
  });

  Object.assign(dictionaries.km || (dictionaries.km = {}), {
    'common.edit': 'កែប្រែ',
    'common.map': 'ផែនទី',
    'common.assign': 'កំណត់ទីតាំង',
    'inventory.search.placeholder': 'ស្វែងរកឈ្មោះ បារកូដ ធ្នើ ឬក្រុមហ៊ុនផលិត...',
    'inventory.table.medicine': 'ថ្នាំ',
    'inventory.table.barcode': 'បារកូដ',
    'inventory.table.location': 'ទីតាំង',
    'inventory.table.stock': 'ស្តុក',
    'inventory.table.boxPrice': 'តម្លៃប្រអប់',
    'inventory.table.unitPrice': 'តម្លៃឯកតា',
    'inventory.table.expiry': 'ផុតកំណត់',
    'inventory.table.actions': 'សកម្មភាព',
    'inventory.pageInfo': '{{total}} លទ្ធផល — ទំព័រ {{current}} នៃ {{pages}}{{filter}}',
    'inventory.unit.box': 'ប្រអប់',
    'inventory.unit.boxes': 'ប្រអប់',
    'inventory.unit.unit': 'ឯកតា'
  });

  Object.assign(dictionaries.km || (dictionaries.km = {}), {
    'modal.confirm.deleteMessage': 'លុប {{name}} ចេញពីស្តុកឬ? មិនអាចត្រឡប់វិញបានទេ',
    'modal.confirm.deleted': 'បានលុបថ្នាំរួចរាល់',
    'modal.confirm.unableDelete': 'មិនអាចលុបថ្នាំបានទេ',
    'modal.stock.error.enterValue': 'សូមបញ្ចូលតម្លៃស្តុក',
    'modal.stock.error.wholeNumber': 'ស្តុកត្រូវតែជាចំនួនគត់',
    'modal.stock.toast.updatedFor': 'បានធ្វើបច្ចុប្បន្នភាពស្តុកសម្រាប់ {{name}}',
    'modal.detail.stockBoxes': '{{count}} {{unit}}',
    'modal.detail.reorderAt': 'បញ្ជាទិញបន្ថែមនៅ {{count}} {{unit}}',
    'modal.filterExport.sort.current': 'លំដាប់បច្ចុប្បន្ន',
    'modal.filterExport.sort.low': 'ស្តុកទាបមុន',
    'modal.filterExport.sort.expiry': 'ផុតកំណត់ជិតបំផុត',
    'modal.filterExport.sort.name': 'អក្សរ A-Z',
    'modal.filterExport.sort.value': 'តម្លៃខ្ពស់បំផុត',
    'modal.filterExport.apply': 'អនុវត្តតម្រង',
    'modal.filterExport.exportFiltered': 'នាំចេញលទ្ធផលដែលបានតម្រង',
    'modal.filterExport.exportAll': 'នាំចេញស្តុកទាំងអស់'
  });

  function syncLanguageControls() {
    document.querySelectorAll('[data-lang-switch]').forEach((group) => {
      group.querySelectorAll('[data-lang]').forEach((button) => {
        const active = normalizeLanguage(button.getAttribute('data-lang')) === currentLanguage;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    });

    document.querySelectorAll('#mobile-lang-btn').forEach((button) => {
      button.textContent = currentLanguage.toUpperCase();
      button.setAttribute('aria-label', currentLanguage === 'km' ? 'Switch to English' : 'Switch to Khmer');
      button.setAttribute('title', currentLanguage === 'km' ? 'Switch to English' : 'Switch to Khmer');
      button.dataset.lang = currentLanguage;
    });
  }

  function rerenderActiveUi() {
    const activePageId = document.querySelector('.page.active')?.id;
    const pageRenderers = {
      'page-dashboard': globalThis.renderDashboard,
      'page-inventory': globalThis.renderInventory,
      'page-map': globalThis.renderMap,
      'page-alerts': globalThis.renderAlerts,
      'page-analytics': globalThis.renderAnalytics,
    };

    const renderActive = activePageId ? pageRenderers[activePageId] : null;
    if (typeof renderActive === 'function') {
      renderActive();
    }
  }

  function bindLanguageControls(root = document) {
    if (!root?.querySelectorAll) return;
    root.querySelectorAll('[data-lang-switch] [data-lang]').forEach((button) => {
      if (button.dataset.langBound === 'true') return;
      button.dataset.langBound = 'true';
      button.addEventListener('click', () => setLanguage(button.getAttribute('data-lang')));
    });
    root.querySelectorAll('#mobile-lang-btn').forEach((button) => {
      if (button.dataset.langBound === 'true') return;
      button.dataset.langBound = 'true';
      button.addEventListener('click', () => setLanguage(currentLanguage === 'km' ? 'en' : 'km'));
    });
    syncLanguageControls();
  }

  function normalizeLanguage(lang) {
    const value = String(lang || 'en').trim().toLowerCase();
    if (!value) return 'en';
    if (value.startsWith('km')) return 'km';
    return 'en';
  }

  function loadPreferredLanguage() {
    try {
      const stored = localStorage.getItem(I18N_STORAGE_KEY);
      if (stored) return normalizeLanguage(stored);
    } catch (_) {
      // Ignore storage issues and fall back safely.
    }
    return normalizeLanguage(navigator.language || 'en');
  }

  let currentLanguage = loadPreferredLanguage();

  function lookup(lang, key) {
    return dictionaries[lang]?.[key];
  }

  function interpolate(template, params) {
    if (!params) return template;
    return String(template).replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, token) => {
      const value = params[token];
      return value == null ? '' : String(value);
    });
  }

  function t(key, params, fallback = '') {
    const resolved =
      lookup(currentLanguage, key) ??
      lookup('en', key) ??
      fallback;
    return interpolate(resolved || key, params);
  }

  function registerTranslations(lang, entries) {
    const normalized = normalizeLanguage(lang);
    dictionaries[normalized] = {
      ...(dictionaries[normalized] || {}),
      ...(entries || {}),
    };
  }

  function applyStaticTranslations(root = document) {
    if (!root?.querySelectorAll) return;

    root.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      el.textContent = t(key, null, el.textContent);
    });

    root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (!key) return;
      el.setAttribute('placeholder', t(key, null, el.getAttribute('placeholder') || ''));
    });

    root.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      if (!key) return;
      el.setAttribute('title', t(key, null, el.getAttribute('title') || ''));
    });

    root.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria-label');
      if (!key) return;
      el.setAttribute('aria-label', t(key, null, el.getAttribute('aria-label') || ''));
    });

    syncLanguageControls();
  }

  function setLanguage(lang) {
    currentLanguage = normalizeLanguage(lang);
    try {
      localStorage.setItem(I18N_STORAGE_KEY, currentLanguage);
    } catch (_) {
      // Ignore storage issues and keep in-memory language.
    }
    document.documentElement.lang = currentLanguage;
    applyStaticTranslations(document);
    rerenderActiveUi();
    applyStaticTranslations(document);
    window.dispatchEvent(new CustomEvent('rxscan:languagechange', {
      detail: { language: currentLanguage },
    }));
  }

  function getLanguage() {
    return currentLanguage;
  }

  document.documentElement.lang = currentLanguage;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyStaticTranslations(document);
      bindLanguageControls(document);
    }, { once: true });
  } else {
    applyStaticTranslations(document);
    bindLanguageControls(document);
  }

  globalThis.i18n = {
    t,
    setLanguage,
    getLanguage,
    registerTranslations,
    apply: applyStaticTranslations,
    dictionaries,
  };
  globalThis.t = t;
})();
