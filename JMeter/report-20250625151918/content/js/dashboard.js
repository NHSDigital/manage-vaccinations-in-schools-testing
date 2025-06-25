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

    var data = {"OkPercent": 99.97139315342805, "KoPercent": 0.028606846571946218};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.43155407499225285, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "5.0 Consent for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.848987108655617, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.5, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.8257978723404256, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.44, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.7794520547945205, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [9.433962264150943E-4, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.390625, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [0.0048828125, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.828125, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.44862385321100917, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.5, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9142857142857143, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.004166666666666667, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.42176258992805754, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.31253577561534057, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.5, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.4966235227912212, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.5, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [0.5, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.005434782608695652, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent for td_ipv"], "isController": true}, {"data": [0.7385057471264368, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.7822878228782287, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.484375, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.5, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [0.9121621621621622, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.4994340690435767, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.46875, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for flu"], "isController": true}, {"data": [0.4423423423423423, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10487, 3, 0.028606846571946218, 890.8218747020129, 153, 4629, 863.0, 1485.0, 1611.6000000000004, 1998.3200000000088, 2.9129042463627584, 75.18620761270526, 4.151756995539398], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["5.0 Consent for menacwy", 5, 0, 0.0, 7105.4, 6238, 7718, 7211.0, 7718.0, 7718.0, 7718.0, 0.0024917734100865993, 0.5623942320055337, 0.039959869366287204], "isController": true}, {"data": ["2.0 Register attendance", 549, 0, 0.0, 5211.994535519126, 3404, 8445, 5106.0, 6035.0, 6399.0, 7003.5, 0.1566420509437612, 36.07464627678394, 0.6802531362470562], "isController": true}, {"data": ["2.5 Select patient", 543, 0, 0.0, 524.2486187845303, 403, 1491, 447.0, 834.6000000000008, 902.3999999999999, 1199.3999999999965, 0.15585238626363565, 4.0474962703418935, 0.108061713132013], "isController": false}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 593.3714285714286, 526, 889, 555.0, 760.5999999999999, 803.8000000000001, 889.0, 0.07981664975313851, 1.1468966645192187, 0.115360001596333], "isController": false}, {"data": ["2.5 Select menacwy", 376, 0, 0.0, 567.6276595744686, 403, 1369, 457.0, 891.6, 981.7499999999999, 1138.2100000000005, 0.11479818875325808, 2.6416770964904726, 0.08004483082990847], "isController": false}, {"data": ["2.3 Search by first/last name", 550, 0, 0.0, 1103.3272727272724, 719, 2520, 997.5, 1588.8000000000002, 1834.6999999999996, 2207.0300000000007, 0.15660565500172835, 10.136049372050476, 0.13511353091367156], "isController": false}, {"data": ["2.5 Select td_ipv", 365, 0, 0.0, 589.8904109589041, 403, 1593, 473.0, 906.0, 1001.2999999999995, 1272.7799999999984, 0.11506097758958915, 2.688027430950804, 0.08011570021618854], "isController": false}, {"data": ["4.0 Vaccination for flu", 530, 0, 0.0, 2807.450943396231, 1465, 4220, 2745.5, 3137.5, 3317.2, 3881.2099999999996, 0.1549167205708652, 8.116124155649066, 0.9133509860449264], "isController": true}, {"data": ["5.8 Consent confirm", 32, 0, 0.0, 1378.78125, 1047, 2069, 1297.5, 1882.8999999999999, 2059.25, 2069.0, 0.009845287460857291, 0.9777339714297449, 0.021694905752139965], "isController": false}, {"data": ["4.0 Vaccination for hpv", 512, 0, 0.0, 2817.470703125001, 1174, 4068, 2770.5, 3199.1, 3437.45, 3818.8500000000004, 0.15452811128921415, 7.896667137337311, 0.9100313643775882], "isController": true}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 156.2714285714286, 153, 171, 155.5, 159.9, 163.60000000000002, 171.0, 0.07896907007151213, 0.475896612706349, 0.04758194944738573], "isController": false}, {"data": ["5.9 Patient home page", 32, 0, 0.0, 513.84375, 413, 899, 465.5, 733.0999999999999, 875.5999999999999, 899.0, 0.009862552995812113, 0.2406724182687151, 0.007359292092913879], "isController": false}, {"data": ["2.4 Patient attending session", 545, 0, 0.0, 1222.7137614678884, 934, 3296, 1156.0, 1512.2, 1706.0, 2194.7799999999997, 0.15571570940077167, 9.0033501734873, 0.23144463838669382], "isController": false}, {"data": ["5.4 Consent route", 32, 0, 0.0, 622.9062500000002, 545, 1104, 579.5, 758.0, 883.6499999999993, 1104.0, 0.009840597693302398, 0.11189235270239727, 0.015611077572355301], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 475.48571428571427, 454, 661, 463.0, 504.9, 519.85, 661.0, 0.07890497924235439, 0.4072390774373466, 0.04276588230420575], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 579.5, 531, 1130, 548.5, 649.8, 709.0000000000001, 1130.0, 0.07985015547965989, 0.7748740185560353, 0.12562363327903522], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 360, 3, 0.8333333333333334, 2785.327777777777, 158, 3885, 2762.5, 3183.3, 3379.5499999999997, 3632.85, 0.11482418503534672, 6.371823713359124, 0.6723257546979039], "isController": true}, {"data": ["2.1 Open session", 556, 0, 0.0, 1209.9100719424462, 712, 4629, 1154.0, 1606.6, 1781.15, 2097.779999999998, 0.15732951818683955, 2.7393517331466413, 0.10268322079981121], "isController": false}, {"data": ["4.3 Vaccination confirm", 1747, 0, 0.0, 1380.8328563251296, 1016, 2872, 1322.0, 1748.2, 1902.0, 2378.0, 0.5147174725515933, 10.823384643955164, 1.19800321403791], "isController": false}, {"data": ["5.6 Consent questions", 32, 0, 0.0, 721.75, 547, 1429, 618.0, 1034.8999999999999, 1271.0499999999995, 1429.0, 0.009839768593242109, 0.12069301365283268, 0.024546270877605886], "isController": false}, {"data": ["4.1 Vaccination questions", 1777, 3, 0.16882386043894204, 771.9786156443439, 156, 1664, 760.0, 986.0, 1075.4999999999995, 1377.7600000000002, 0.5168194633570056, 5.993696516220191, 1.0199723720079295], "isController": false}, {"data": ["5.3 Consent parent details", 32, 0, 0.0, 656.59375, 541, 1387, 569.5, 890.4, 1119.849999999999, 1387.0, 0.009842598396763753, 0.1112693012970084, 0.018112147238966602], "isController": false}, {"data": ["5.2 Consent who", 32, 0, 0.0, 702.3750000000001, 555, 1450, 600.5, 1020.2, 1255.6499999999994, 1450.0, 0.009845908455820023, 0.20257397767547947, 0.015629117685836136], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 2236.871428571428, 2058, 2804, 2205.0, 2384.5, 2485.4, 2804.0, 0.07874706667176648, 3.6392064805742237, 0.37489448244615386], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 368, 0, 0.0, 2815.9918478260884, 1143, 4713, 2761.5, 3202.8, 3428.4, 3707.98, 0.1140379120278079, 5.988538901744408, 0.6724142929943846], "isController": true}, {"data": ["5.0 Consent for td_ipv", 5, 0, 0.0, 7664.8, 7392, 7823, 7705.0, 7823.0, 7823.0, 7823.0, 0.0025008728046088083, 0.5653027594130352, 0.04009846702124042], "isController": true}, {"data": ["2.5 Select hpv", 522, 0, 0.0, 660.5057471264366, 404, 1490, 529.0, 955.0, 1058.6999999999998, 1256.5899999999988, 0.15505999069045956, 3.36860728428467, 0.11553786415705142], "isController": false}, {"data": ["2.5 Select flu", 542, 0, 0.0, 610.7730627306269, 402, 2355, 474.5, 923.0, 1006.0, 1418.1000000000015, 0.1557346408147163, 3.270591607472418, 0.10798007322114118], "isController": false}, {"data": ["5.1 Consent start", 32, 0, 0.0, 931.1875000000001, 709, 1601, 912.0, 1129.1, 1430.6999999999994, 1601.0, 0.009845875132150104, 0.12379276975082551, 0.021245191866876383], "isController": false}, {"data": ["5.5 Consent agree", 32, 0, 0.0, 690.75, 546, 1216, 604.5, 1000.9, 1088.5999999999997, 1216.0, 0.00982923848282018, 0.1983281636402339, 0.01541067892623556], "isController": false}, {"data": ["1.5 Open Sessions list", 74, 0, 0.0, 430.6756756756757, 374, 575, 405.5, 529.0, 554.0, 575.0, 0.027972493211000295, 0.3063862147017376, 0.016796194588002973], "isController": false}, {"data": ["4.2 Vaccination batch", 1767, 0, 0.0, 673.688172043012, 546, 3085, 601.0, 892.2, 965.1999999999998, 1189.3999999999987, 0.5157705530332971, 10.499423235729765, 0.8343496748485526], "isController": false}, {"data": ["5.0 Consent for hpv", 9, 0, 0.0, 7080.0, 6198, 7793, 6961.0, 7793.0, 7793.0, 7793.0, 0.002946819726666099, 0.6563231972625682, 0.04722585572370618], "isController": true}, {"data": ["5.7 Consent triage", 32, 0, 0.0, 917.71875, 565, 2175, 902.0, 1275.5, 1750.5499999999986, 2175.0, 0.009848193179695364, 0.1687618096570459, 0.016518444627148944], "isController": false}, {"data": ["5.0 Consent for flu", 13, 0, 0.0, 6982.923076923076, 6290, 7704, 6711.0, 7652.4, 7704.0, 7704.0, 0.004255184041619628, 1.0043739890869259, 0.06643738521231896], "isController": true}, {"data": ["2.2 Session register", 555, 0, 0.0, 1163.6594594594583, 692, 2676, 1086.0, 1546.2000000000003, 1678.1999999999998, 2120.4799999999977, 0.15718140603440658, 10.185798179393261, 0.10396618514638545], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 3, 100.0, 0.028606846571946218], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10487, 3, "422/Unprocessable Entity", 3, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.1 Vaccination questions", 1777, 3, "422/Unprocessable Entity", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
