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

    var data = {"OkPercent": 99.94716872388454, "KoPercent": 0.05283127611546035};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.45513679728770795, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.16394001363326516, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.4246483590087073, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.8027098479841375, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8276428102429416, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.6057942708333334, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.3664226898444648, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.13137254901960785, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.478231748158071, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.5022771633051398, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5496083550913838, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.7675409836065574, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.07521255722694571, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 20821, 11, 0.05283127611546035, 1040.2524374429624, 0, 17494, 770.0, 2124.0, 2825.9500000000007, 5474.910000000014, 5.780173513474348, 1946.4944985908207, 20.784869678893745], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1467, 0, 0.0, 2032.3987730061313, 1009, 13907, 1727.0, 3074.4, 3888.599999999997, 6224.279999999993, 0.4260390910469061, 165.29739333893906, 2.2099617888929837], "isController": false}, {"data": ["4.1 Vaccination questions", 1493, 0, 0.0, 1289.621567314133, 592, 5755, 1151.0, 1635.6000000000001, 1951.4999999999998, 3268.439999999988, 0.42754647885549274, 162.86888054414382, 2.1252628293117333], "isController": false}, {"data": ["Get Next Patient from STS", 1530, 0, 0.0, 0.5372549019607833, 0, 2, 1.0, 1.0, 1.0, 1.0, 0.42726843935594727, 0.1798175284503532, 0.2727706130317712], "isController": false}, {"data": ["2.0 Register attendance", 1520, 11, 0.7236842105263158, 5687.798026315802, 2392, 20031, 5019.5, 8705.700000000003, 10657.250000000002, 14466.06, 0.4256291470839923, 791.3473536542782, 7.725365361144931], "isController": true}, {"data": ["1.0 Login", 1532, 0, 0.0, 4386.1540469974, 1775, 14367, 4151.0, 5479.7, 5985.699999999998, 9034.850000000004, 0.42673405276460713, 686.3047484299871, 7.091744866134475], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 370, 0, 0.0, 4141.275675675682, 1614, 11732, 3797.5, 5446.800000000001, 6523.049999999998, 9950.770000000015, 0.1068891192943238, 122.6796157448106, 1.553449746116675], "isController": true}, {"data": ["2.5 Select patient", 1513, 0, 0.0, 565.0449438202245, 295, 6688, 422.0, 898.4000000000005, 1201.0999999999997, 2481.059999999993, 0.4283841141693213, 168.54137150152383, 1.522656079012661], "isController": false}, {"data": ["2.3 Search by first/last name", 1523, 0, 0.0, 500.1240971766252, 293, 4546, 427.0, 696.4000000000005, 864.9999999999998, 1408.76, 0.42659726081422655, 167.1473915112817, 1.5774055963615428], "isController": false}, {"data": ["4.0 Vaccination for flu", 372, 0, 0.0, 4313.962365591402, 1994, 15635, 3889.0, 5794.299999999999, 6785.099999999982, 11349.759999999998, 0.10644559557026081, 122.43721626803101, 1.5541037951503158], "isController": true}, {"data": ["4.0 Vaccination for hpv", 381, 0, 0.0, 4120.845144356954, 1845, 9330, 3850.0, 5482.6, 6009.0999999999985, 8051.280000000001, 0.10918751307527634, 124.7523043943138, 1.5863371914951239], "isController": true}, {"data": ["1.2 Sign-in page", 1536, 0, 0.0, 809.0631510416655, 186, 9066, 644.5, 1272.3, 1599.099999999998, 2425.339999999998, 0.42744794652448087, 165.58397286307334, 1.825611932278303], "isController": false}, {"data": ["2.4 Patient attending session", 1093, 11, 1.0064043915827996, 1380.1774931381512, 378, 7109, 1187.0, 2033.6, 2544.8999999999996, 4379.479999999994, 0.3074731446260277, 119.91354950704431, 1.3444782685513486], "isController": false}, {"data": ["Debug Sampler", 1520, 0, 0.0, 0.4500000000000003, 0, 4, 0.0, 1.0, 1.0, 1.0, 0.42778449005415137, 2.6478523657502513, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1530, 0, 0.0, 1863.3594771241842, 1142, 6279, 1764.5, 2457.8, 2797.9, 3693.4500000000003, 0.4270398269065235, 190.03585752074352, 1.5173989335587434], "isController": false}, {"data": ["4.2 Vaccination batch", 1493, 0, 0.0, 907.7836570663078, 464, 6804, 785.0, 1220.4000000000005, 1525.6, 3124.8799999999974, 0.4278535222117018, 164.27130594747203, 1.915528242648972], "isController": false}, {"data": ["1.1 Homepage", 1537, 0, 0.0, 793.0383864671431, 451, 6089, 705.0, 1140.2, 1389.7999999999993, 2045.8199999999988, 0.4271524439539587, 165.36717528919291, 1.8161968869841343], "isController": false}, {"data": ["1.3 Sign-in", 1532, 0, 0.0, 922.7389033942562, 390, 7396, 808.5, 1330.0, 1635.6999999999998, 3729.3600000000006, 0.42690600154042846, 166.24281584835236, 1.941319534718437], "isController": false}, {"data": ["2.2 Session register", 1525, 0, 0.0, 552.9272131147525, 286, 7034, 484.0, 800.0, 960.4000000000001, 1925.3400000000004, 0.4265347699956703, 171.10149574687148, 1.5229184146143118], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 370, 0, 0.0, 4203.100000000002, 1760, 12327, 3832.0, 5501.300000000001, 6775.95, 10683.740000000029, 0.10648738412301884, 121.82330522045406, 1.5459347024577], "isController": true}, {"data": ["2.1 Open session", 1529, 0, 0.0, 3074.419882275999, 770, 17494, 2453.0, 5455.0, 7535.5, 11359.300000000005, 0.4268662766707669, 165.5125897393694, 1.5203555923111585], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 11, 100.0, 0.05283127611546035], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 20821, 11, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 11, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1093, 11, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 11, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
