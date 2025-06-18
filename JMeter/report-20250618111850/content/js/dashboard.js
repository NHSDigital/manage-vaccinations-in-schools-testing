/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.79409746053534, "KoPercent": 0.2059025394646534};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5376672952214506, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Prevent multiple runs"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Completed sessions list"], "isController": false}, {"data": [0.9428571428571428, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [1.0, 500, 1500, "Scheduled sessions list"], "isController": false}, {"data": [0.3678996036988111, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.5, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [0.7535070140280561, 500, 1500, "5.9 Patient return to td_ipv vaccination page"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.03652834599649328, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [0.22459893048128343, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.75, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9857142857142858, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7714285714285715, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Get school name"], "isController": false}, {"data": [0.31758530183727035, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.8423370522607164, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.4121338912133891, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [1.0, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.6336432306798373, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.75, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [0.9013387660069848, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.4652250146113384, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [0.75, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.014285714285714285, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent"], "isController": true}, {"data": [0.7282398452611218, 500, 1500, "5.9 Patient return to menacwy vaccination page"], "isController": false}, {"data": [0.002616279069767442, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [0.7865771812080536, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.75, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.9320987654320988, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.7749406175771971, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.75, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.3796052631578947, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.5, 500, 1500, "5.1 Consent homepage"], "isController": false}, {"data": [1.0, 500, 1500, "Calculate slug"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 17484, 36, 0.2059025394646534, 763.476035232211, 0, 6763, 602.0, 1468.0, 1786.75, 2806.0, 4.855637541265559, 162.3700019989687, 5.52865624851594], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Prevent multiple runs", 1, 0, 0.0, 19.0, 19, 19, 19.0, 19.0, 19.0, 19.0, 52.63157894736842, 0.0, 0.0], "isController": false}, {"data": ["2.0 Register attendance", 756, 0, 0.0, 6528.035714285709, 3944, 11531, 6277.0, 8086.500000000003, 8985.199999999999, 10637.929999999993, 0.21556087170991667, 65.15630802910785, 0.9357246545786726], "isController": true}, {"data": ["Completed sessions list", 1, 0, 0.0, 319.0, 319, 319, 319.0, 319.0, 319.0, 319.0, 3.134796238244514, 43.498359130094045, 1.9041438087774294], "isController": false}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 431.9571428571428, 378, 740, 407.5, 518.1, 570.3000000000001, 740.0, 0.07832719956763386, 1.1270243734663254, 0.11320728062509582], "isController": false}, {"data": ["Scheduled sessions list", 1, 0, 0.0, 308.0, 308, 308, 308.0, 308.0, 308.0, 308.0, 3.246753246753247, 42.090477881493506, 1.9721489448051948], "isController": false}, {"data": ["2.3 Search by first/last name", 757, 0, 0.0, 1412.8097754293262, 927, 6424, 1277.0, 1906.2, 2308.8, 3163.999999999992, 0.21595228395928115, 20.604189920940637, 0.18627489156741991], "isController": false}, {"data": ["5.8 Consent confirm", 2, 0, 0.0, 916.5, 875, 958, 916.5, 958.0, 958.0, 958.0, 0.011338961237761009, 0.9284715735785194, 0.02493131955744034], "isController": false}, {"data": ["5.9 Patient return to td_ipv vaccination page", 499, 0, 0.0, 554.9158316633268, 327, 2131, 487.0, 775.0, 988.0, 1479.0, 0.1524834170464237, 4.4867440339526174, 0.10618835155036521], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 97.7142857142857, 89, 334, 92.5, 102.8, 111.60000000000002, 334.0, 0.07892793315931604, 0.47726734582273916, 0.047557162850876945], "isController": false}, {"data": ["3.0 Nurse triage", 1711, 0, 0.0, 1976.1355932203385, 1200, 7735, 1818.0, 2572.0, 3051.399999999996, 4404.039999999994, 0.4943128026438079, 61.94295126302554, 1.486703173395744], "isController": true}, {"data": ["2.4 Patient attending session", 748, 0, 0.0, 1712.4852941176466, 1104, 5393, 1547.0, 2378.4, 2774.899999999999, 4128.59, 0.21372301782615688, 17.54367409466658, 0.31766253235489333], "isController": false}, {"data": ["5.4 Consent route", 2, 0, 0.0, 547.5, 460, 635, 547.5, 635.0, 635.0, 635.0, 0.010973936899862827, 0.12509645061728394, 0.017355752743484224], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 294.92857142857133, 259, 743, 274.0, 350.0, 375.9000000000001, 743.0, 0.07890373406285472, 0.40885079388428425, 0.042765207426644886], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 528.6714285714287, 449, 993, 494.0, 650.1, 774.7000000000003, 993.0, 0.07845704140738483, 0.7629640804050177, 0.12343192744853218], "isController": false}, {"data": ["Get school name", 1, 0, 0.0, 6763.0, 6763, 6763, 6763.0, 6763.0, 6763.0, 6763.0, 0.1478633742422002, 1469.6804995933758, 0.09255900672778353], "isController": false}, {"data": ["2.1 Open session", 762, 0, 0.0, 1489.7112860892387, 781, 4626, 1313.5, 2169.1000000000004, 2642.8, 3799.4800000000005, 0.21572529846246183, 3.57847576151455, 0.14117603552389824], "isController": false}, {"data": ["3.3 Nurse triage complete", 1703, 0, 0.0, 518.6283029947164, 329, 5993, 425.0, 702.8000000000004, 982.799999999999, 1850.8400000000001, 0.4938500731495484, 11.968718497755491, 0.3347260738810439], "isController": false}, {"data": ["4.3 Vaccination confirm", 1673, 0, 0.0, 1301.4955170352648, 841, 5149, 1185.0, 1766.6000000000001, 2158.0999999999995, 3457.279999999999, 0.49839102812736646, 12.996691877883324, 1.160318357881996], "isController": false}, {"data": ["5.6 Consent questions", 2, 0, 0.0, 458.0, 417, 499, 458.0, 499.0, 499.0, 499.0, 0.011219503985728792, 0.1350175269688827, 0.022050050557889837], "isController": false}, {"data": ["4.1 Vaccination questions", 1721, 36, 2.0918070889018012, 635.6728646135961, 94, 4619, 600.0, 828.5999999999999, 1048.6999999999982, 2101.0199999999995, 0.5047059948280099, 5.788772453514848, 1.076346741211488], "isController": false}, {"data": ["5.3 Consent parent details", 2, 0, 0.0, 751.0, 434, 1068, 751.0, 1068.0, 1068.0, 1068.0, 0.01097309397357679, 0.12431529608150814, 0.018565317684786902], "isController": false}, {"data": ["3.1 Nurse triage new", 1718, 0, 0.0, 431.22118742724075, 291, 3322, 362.0, 556.0, 671.2499999999998, 1545.5899999999979, 0.4934821860973602, 5.5505528340648915, 0.3402622888877176], "isController": false}, {"data": ["3.2 Nurse triage result", 1711, 0, 0.0, 1028.388077147868, 596, 4340, 923.0, 1349.0, 1741.3999999999999, 2973.879999999997, 0.49418687773539366, 44.447814219527, 0.8121881839838105], "isController": false}, {"data": ["5.2 Consent who", 2, 0, 0.0, 685.5, 497, 874, 685.5, 874.0, 874.0, 874.0, 0.011199023445155581, 0.16798535167733375, 0.017722673332885373], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 1817.8285714285716, 1497, 9366, 1654.5, 2035.6, 2170.3, 9366.0, 0.07875734412233941, 14.918415434231429, 0.3770145267218043], "isController": true}, {"data": ["5.0 Consent", 2, 0, 0.0, 5657.0, 5590, 5724, 5657.0, 5724.0, 5724.0, 5724.0, 0.010826084367675477, 2.2031081688219594, 0.16417799232971922], "isController": true}, {"data": ["5.9 Patient return to menacwy vaccination page", 517, 0, 0.0, 581.7021276595743, 331, 6040, 521.0, 779.0, 980.3999999999995, 1908.0600000000068, 0.15454481321301355, 4.5013097682261245, 0.10777425753846881], "isController": false}, {"data": ["4.0 Vaccination", 1720, 36, 2.0930232558139537, 2456.7052325581353, 95, 7122, 2311.0, 3158.0, 3737.699999999999, 5424.5999999999985, 0.4997682760464261, 26.451244183746926, 2.988752081157138], "isController": true}, {"data": ["2.5 Patient return to consent page", 745, 0, 0.0, 549.2617449664424, 323, 3313, 447.0, 774.4, 955.4999999999997, 2125.0999999999976, 0.21482456762590882, 4.707144812357949, 0.1489506279437454], "isController": false}, {"data": ["5.5 Consent agree", 2, 0, 0.0, 507.5, 454, 561, 507.5, 561.0, 561.0, 561.0, 0.011353379617277573, 0.19739247462519657, 0.01774519929438746], "isController": false}, {"data": ["Debug Sampler", 1942, 0, 0.0, 0.24768280123583897, 0, 15, 0.0, 1.0, 1.0, 1.0, 0.5528016683110286, 2.1797430279063787, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 243, 0, 0.0, 404.7448559670783, 297, 2214, 344.0, 527.4, 600.5999999999999, 1107.1600000000003, 0.06851524365486814, 0.801976279733642, 0.04347322387976167], "isController": false}, {"data": ["4.2 Vaccination batch", 1684, 0, 0.0, 566.9340855106889, 406, 4055, 486.0, 732.0, 954.75, 1816.15, 0.49469030448129486, 8.131134515958463, 0.7999088658328805], "isController": false}, {"data": ["5.7 Consent triage", 2, 0, 0.0, 605.5, 469, 742, 605.5, 742.0, 742.0, 742.0, 0.011507413651244814, 0.1880237221736354, 0.019312002304359584], "isController": false}, {"data": ["2.2 Session register", 760, 0, 0.0, 1388.2776315789467, 709, 4787, 1288.5, 1783.6, 2235.199999999999, 3071.0899999999983, 0.2155135745194898, 18.004979730469792, 0.14292894379207477], "isController": false}, {"data": ["5.1 Consent homepage", 2, 0, 0.0, 682.0, 624, 740, 682.0, 740.0, 740.0, 740.0, 0.011019344459198123, 0.13888786060804742, 0.023749700411572518], "isController": false}, {"data": ["Calculate slug", 1, 0, 0.0, 60.0, 60, 60, 60.0, 60.0, 60.0, 60.0, 16.666666666666668, 0.11393229166666667, 0.0], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 36, 100.0, 0.2059025394646534], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 17484, 36, "422/Unprocessable Entity", 36, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.1 Vaccination questions", 1721, 36, "422/Unprocessable Entity", 36, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
