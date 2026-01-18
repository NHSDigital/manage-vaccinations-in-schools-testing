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

    var data = {"OkPercent": 99.92905788876277, "KoPercent": 0.07094211123723042};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8240274951038746, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.3661320172732881, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9907120743034056, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.4807692307692308, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.989858635525507, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.44138755980861244, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.43424317617866004, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.25, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9765060240963855, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.6860382707299787, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9795550210463019, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9770946353224834, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.41948051948051945, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.8865030674846626, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.4423076923076923, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.5280791320995533, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9843161856963614, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.3076923076923077, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.5138637733574443, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.43766233766233764, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5370370370370371, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.9399141630901288, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9820979899497487, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.983732351135666, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.8846153846153846, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21144, 15, 0.07094211123723042, 272.69958380628105, 0, 60000, 123.0, 632.9000000000015, 846.0, 1754.950000000008, 5.617211876800708, 2211.574438613384, 42.51391563522394], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 26, 0, 0.0, 128.1153846153846, 83, 286, 105.5, 209.80000000000007, 277.95, 286.0, 0.007736004674927133, 3.3133141819487473, 0.0570829626807696], "isController": false}, {"data": ["2.0 Register attendance", 1621, 13, 0.8019740900678594, 1313.374460209749, 391, 8213, 1168.0, 1935.6, 2288.799999999997, 3892.039999999994, 0.45384156869596287, 942.1278216316891, 16.550048776244626], "isController": true}, {"data": ["2.5 Select patient", 1615, 0, 0.0, 125.11145510835912, 54, 5286, 87.0, 180.4000000000001, 284.39999999999964, 622.5599999999993, 0.4540868945180043, 191.4053257688619, 3.2503078398102336], "isController": false}, {"data": ["7.1 Full name search", 26, 0, 0.0, 1214.6153846153845, 445, 4791, 669.0, 4539.400000000001, 4788.2, 4791.0, 0.007609258711869566, 3.2721461552939957, 0.05574359331511989], "isController": false}, {"data": ["2.3 Search by first/last name", 1627, 0, 0.0, 123.76152427781186, 57, 4119, 87.0, 170.20000000000005, 263.5999999999999, 693.44, 0.45521809479336256, 193.6693909032554, 3.379664999649563], "isController": false}, {"data": ["4.0 Vaccination for flu", 418, 0, 0.0, 1117.4904306220092, 204, 8270, 973.0, 1601.5, 1968.3499999999997, 4170.620000000003, 0.11902931310404528, 146.52697346303046, 3.3452406027709913], "isController": true}, {"data": ["4.0 Vaccination for hpv", 403, 0, 0.0, 1123.7866004962777, 212, 5135, 950.0, 1757.2000000000003, 2126.999999999999, 3643.8399999999965, 0.11592945505676804, 142.92069941635415, 3.27160146410919], "isController": true}, {"data": ["7.6 First name search", 26, 0, 0.0, 2771.2307692307686, 726, 16320, 1659.0, 6111.400000000001, 12903.299999999987, 16320.0, 0.0077365249077419405, 3.997360192161145, 0.0566201225115914], "isController": false}, {"data": ["1.2 Sign-in page", 1660, 0, 0.0, 172.3246987951807, 13, 5615, 103.5, 271.9000000000001, 421.6499999999987, 1205.3399999999865, 0.46201756390384807, 193.54497731417223, 3.8887226652944373], "isController": false}, {"data": ["2.4 Patient attending session", 1411, 13, 0.9213323883770376, 629.4216867469886, 102, 6502, 532.0, 951.1999999999998, 1138.1999999999996, 1698.5599999999986, 0.39576733704960076, 168.79139464090073, 3.443035917463577], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 22.0, 22, 22, 22.0, 22.0, 22.0, 22.0, 45.45454545454545, 14.24893465909091, 26.811079545454547], "isController": false}, {"data": ["1.1 Homepage", 1663, 0, 0.0, 159.5634395670474, 27, 4600, 107.0, 253.0, 408.7999999999997, 836.3999999999985, 0.4620971932388762, 193.3809212932539, 3.8810694216456274], "isController": false}, {"data": ["1.3 Sign-in", 1659, 0, 0.0, 182.12778782399067, 63, 5055, 109.0, 316.0, 455.0, 1149.6000000000022, 0.4620256161037789, 193.7578705164682, 4.047373454257654], "isController": false}, {"data": ["Run some searches", 26, 1, 3.8461538461538463, 14471.615384615388, 7456, 69861, 10255.0, 23541.200000000004, 54950.99999999994, 69861.0, 0.007573883966349816, 29.81184221454978, 0.44384171909760667], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 385, 0, 0.0, 1173.4805194805192, 202, 5874, 994.0, 1730.6000000000004, 2192.5999999999995, 4674.119999999995, 0.11162500492889632, 138.32599377784828, 3.1501485835729164], "isController": true}, {"data": ["2.1 Open session", 1630, 0, 0.0, 374.7552147239265, 102, 3959, 284.5, 688.7000000000003, 864.8999999999996, 1413.2900000000022, 0.4548903644453226, 190.82989056502964, 3.259087296234233], "isController": false}, {"data": ["7.7 Partial name search", 26, 0, 0.0, 1455.307692307692, 307, 4711, 794.0, 4264.0, 4708.9, 4711.0, 0.00774511424788238, 4.001769681806131, 0.05667542041448277], "isController": false}, {"data": ["4.3 Vaccination confirm", 1567, 0, 0.0, 821.3777919591572, 422, 8076, 665.0, 1257.2, 1518.6, 3065.839999999996, 0.4523335155753411, 189.44151227017807, 4.628273414718246], "isController": false}, {"data": ["4.1 Vaccination questions", 1594, 0, 0.0, 166.56587202007523, 75, 3603, 117.0, 257.5, 374.25, 870.3499999999997, 0.4534578436401115, 185.81602975121908, 4.2223877839409925], "isController": false}, {"data": ["7.7 Last name search", 26, 0, 0.0, 1535.4999999999998, 741, 3364, 1354.5, 2787.5, 3217.3499999999995, 3364.0, 0.007741765664495101, 4.002072960111743, 0.056659931144438416], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 26.0, 26, 26, 26.0, 26.0, 26.0, 26.0, 38.46153846153847, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1659, 1, 0.06027727546714889, 854.9041591320081, 402, 13887, 698.0, 1193.0, 1520.0, 3551.20000000004, 0.46206010290655025, 797.9388229851819, 15.067933423134255], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 385, 0, 0.0, 1116.4909090909096, 203, 5855, 987.0, 1636.4, 1826.1, 3149.4399999999987, 0.11119721273355386, 137.45593866856356, 3.138274787790228], "isController": true}, {"data": ["7.0 Open Children Search", 27, 0, 0.0, 1250.5555555555557, 296, 4722, 598.0, 4388.4, 4590.799999999999, 4722.0, 0.007622418152873524, 3.9004226326498377, 0.05455564936932959], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 45.0, 45, 45, 45.0, 45.0, 45.0, 45.0, 22.22222222222222, 6.380208333333334, 13.715277777777779], "isController": false}, {"data": ["7.5 year group", 26, 0, 0.0, 1880.6153846153848, 1648, 2619, 1820.5, 2246.9, 2538.4999999999995, 2619.0, 0.0077334781674988085, 3.998102481450063, 0.057253125533535634], "isController": false}, {"data": ["7.2 No Consent search", 26, 1, 3.8461538461538463, 4999.499999999999, 2617, 60000, 2763.5, 3128.7, 40097.24999999992, 60000.0, 0.00760455828923177, 3.7822549122156115, 0.05455236599379], "isController": false}, {"data": ["Debug Sampler", 1627, 0, 0.0, 0.3134603564843266, 0, 4, 0.0, 1.0, 1.0, 1.0, 0.4552357992731896, 2.6267340716260508, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1631, 1, 0.061312078479460456, 346.58185162476985, 181, 2844, 291.0, 517.5999999999999, 650.5999999999988, 1127.080000000002, 0.45502086651484425, 217.6015838530782, 3.2561654294304763], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 47.688802083333336, 102.37630208333333], "isController": false}, {"data": ["4.2 Vaccination batch", 1592, 0, 0.0, 157.13379396984925, 61, 3094, 108.0, 255.70000000000005, 401.0499999999997, 802.7699999999993, 0.45368482127895804, 187.1122911811059, 3.9930775349710634], "isController": false}, {"data": ["2.2 Session register", 1629, 0, 0.0, 142.0159607120932, 55, 3037, 85.0, 265.0, 385.5, 931.5000000000043, 0.45486364840854965, 197.56312470017812, 3.2629066665831306], "isController": false}, {"data": ["7.3 Due vaccination", 26, 0, 0.0, 486.7307692307692, 353, 1596, 418.0, 611.0000000000001, 1283.0999999999988, 1596.0, 0.007736260178761168, 3.9698489511007358, 0.05697907882787922], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 1, 6.666666666666667, 0.004729474082482028], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 13, 86.66666666666667, 0.06148316307226637], "isController": false}, {"data": ["Assertion failed", 1, 6.666666666666667, 0.004729474082482028], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21144, 15, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 13, "504/Gateway Time-out", 1, "Assertion failed", 1, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1411, 13, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 13, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.2 No Consent search", 26, 1, "504/Gateway Time-out", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["1.4 Open Sessions list", 1631, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
