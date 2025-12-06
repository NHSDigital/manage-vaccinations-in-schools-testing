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

    var data = {"OkPercent": 99.17707150964813, "KoPercent": 0.8229284903518729};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4585380116959064, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.12091503267973856, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.4221991701244813, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.8107569721115537, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8231827111984283, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.6245247148288974, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.3516597510373444, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.305984555984556, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.4456066945606695, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.4981060606060606, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5163461538461539, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.738747553816047, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.0703125, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 7048, 58, 0.8229284903518729, 1021.2595062429025, 0, 14168, 787.0, 1967.0, 2748.0, 5695.220000000005, 5.86607894903303, 1964.6084704870707, 21.019273905488962], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 459, 25, 5.446623093681917, 1936.6753812636139, 178, 8763, 1705.0, 2926.0, 3517.0, 6667.799999999993, 0.4350863489999175, 166.77411298281314, 2.221910344841478], "isController": false}, {"data": ["4.1 Vaccination questions", 482, 0, 0.0, 1326.9751037344404, 496, 7551, 1207.5, 1661.1, 1925.0499999999988, 3524.700000000005, 0.4344416703471027, 163.84643135489242, 2.157213156957827], "isController": false}, {"data": ["Get Next Patient from STS", 517, 0, 0.0, 0.6847195357833658, 0, 8, 1.0, 1.0, 1.0, 1.0, 0.43652673325176955, 0.1837977353487021, 0.2786687164214265], "isController": false}, {"data": ["2.0 Register attendance", 504, 8, 1.5873015873015872, 6213.154761904763, 2288, 17803, 5555.5, 9413.0, 11450.25, 15705.55, 0.43718766887891725, 850.9381715173317, 8.38565400298875], "isController": true}, {"data": ["1.0 Login", 520, 0, 0.0, 3939.8019230769237, 1624, 9994, 3746.0, 4937.6, 5565.749999999999, 8774.309999999969, 0.43668855708023313, 695.4662882141853, 7.199192375480777], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 115, 6, 5.217391304347826, 4232.6173913043485, 2065, 10630, 3850.0, 5651.0, 7583.999999999996, 10465.040000000003, 0.10616622676921401, 119.5811950070485, 1.5309429545783952], "isController": true}, {"data": ["2.5 Select patient", 502, 0, 0.0, 539.5717131474096, 303, 3637, 442.0, 819.0999999999999, 1146.5499999999993, 1992.3999999999994, 0.43815969437052077, 168.7113903136595, 1.5573954900209566], "isController": false}, {"data": ["2.3 Search by first/last name", 509, 0, 0.0, 507.1886051080551, 296, 3185, 428.0, 707.0, 895.0, 1883.399999999996, 0.4355497596347201, 170.5368570613826, 1.6105286667043175], "isController": false}, {"data": ["4.0 Vaccination for flu", 124, 5, 4.032258064516129, 4067.7822580645156, 1797, 8295, 4000.5, 5277.0, 6488.75, 8250.5, 0.11305853423257417, 124.82149224215587, 1.6063846188650928], "isController": true}, {"data": ["4.0 Vaccination for hpv", 123, 6, 4.878048780487805, 4157.528455284553, 1872, 9846, 3867.0, 5484.2, 6772.8, 9733.920000000002, 0.11219986536016156, 125.69991650003922, 1.6139313521543286], "isController": true}, {"data": ["1.2 Sign-in page", 526, 0, 0.0, 758.7471482889733, 183, 7622, 622.5, 1194.4, 1460.3499999999995, 2552.060000000002, 0.4399078367992105, 169.06010078781975, 1.8474881189340182], "isController": false}, {"data": ["2.4 Patient attending session", 482, 8, 1.6597510373443984, 1419.3340248962656, 463, 8235, 1225.0, 2211.3999999999996, 2640.8499999999985, 3928.5400000000104, 0.41841875904982484, 162.94685595494752, 1.827647184983628], "isController": false}, {"data": ["Debug Sampler", 504, 0, 0.0, 0.5416666666666664, 0, 5, 1.0, 1.0, 1.0, 1.0, 0.43788543040488764, 2.701186064600264, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 518, 0, 0.0, 1417.397683397683, 786, 4951, 1310.5, 1953.1, 2209.25, 2674.6699999999996, 0.4366311629898614, 193.25908512732477, 1.5494598059098619], "isController": false}, {"data": ["4.2 Vaccination batch", 478, 25, 5.2301255230125525, 951.8263598326363, 490, 5064, 825.5, 1251.1, 1588.4499999999987, 4161.879999999996, 0.43450476909889346, 163.50776323614696, 1.9420908769451586], "isController": false}, {"data": ["1.1 Homepage", 528, 0, 0.0, 813.9621212121206, 470, 5575, 744.5, 1099.3000000000002, 1330.9499999999996, 2357.160000000007, 0.44009572081927817, 169.46548992895538, 1.830545441810677], "isController": false}, {"data": ["1.3 Sign-in", 520, 0, 0.0, 951.6673076923079, 398, 5429, 883.0, 1422.8000000000002, 1679.8999999999996, 2308.069999999999, 0.4362818716492294, 166.99196218165056, 2.0047679656889477], "isController": false}, {"data": ["2.2 Session register", 511, 0, 0.0, 581.3581213307244, 292, 4937, 499.0, 815.0, 1115.1999999999998, 1691.2799999999997, 0.4355408121344568, 177.11190498950995, 1.554055437111231], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 116, 8, 6.896551724137931, 4106.974137931038, 1942, 6990, 3929.0, 5628.2, 6072.199999999998, 6939.679999999999, 0.10822127145066882, 122.95493283750577, 1.5529129277072578], "isController": true}, {"data": ["2.1 Open session", 512, 0, 0.0, 3213.9296875, 932, 14168, 2625.0, 5982.2, 7575.799999999994, 11361.080000000002, 0.43330819807262483, 167.27755181873076, 1.5422868628274884], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /Check and confirm/", 25, 43.10344827586207, 0.3547105561861521], "isController": false}, {"data": ["Test failed: text expected to contain /Vaccination outcome recorded for/", 25, 43.10344827586207, 0.3547105561861521], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, 13.793103448275861, 0.11350737797956867], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 7048, 58, "Test failed: text expected to contain /Check and confirm/", 25, "Test failed: text expected to contain /Vaccination outcome recorded for/", 25, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["4.3 Vaccination confirm", 459, 25, "Test failed: text expected to contain /Vaccination outcome recorded for/", 25, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 482, 8, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.2 Vaccination batch", 478, 25, "Test failed: text expected to contain /Check and confirm/", 25, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
