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

    var data = {"OkPercent": 99.94292644645788, "KoPercent": 0.05707355354212742};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6662243249480729, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4606845513413506, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.7312673450508789, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.17437557816836263, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.969472710453284, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Get Session ID's"], "isController": true}, {"data": [0.9782608695652174, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [1.0, 500, 1500, "Data prep"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.9061685490877498, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.4906474820143885, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.3905299739357081, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.9366327474560592, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9448305821025196, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7836663770634231, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.9639222941720629, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0018450184501845018, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.8635522664199815, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 14017, 8, 0.05707355354212742, 489.8705857173434, 0, 4602, 355.0, 988.0, 1242.0, 1943.0, 5.247666497447486, 121.4600495965227, 6.106130060757922], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1081, 0, 0.0, 1001.630897317299, 702, 3268, 877.0, 1440.2000000000003, 1688.5999999999995, 2358.500000000002, 0.43114313154292605, 8.729267673253931, 1.0039521848407522], "isController": false}, {"data": ["4.1 Vaccination questions", 1081, 0, 0.0, 551.1369102682705, 296, 2260, 504.0, 707.4000000000002, 808.8999999999985, 1086.18, 0.43124529759116986, 4.985706132634259, 0.910603564769972], "isController": false}, {"data": ["2.0 Register attendance", 1081, 8, 0.7400555041628122, 1681.033302497688, 874, 4305, 1655.0, 2286.8, 2533.7, 3220.9400000000023, 0.43054932677379554, 48.86876748982175, 1.619621422402943], "isController": true}, {"data": ["1.0 Login", 1151, 0, 0.0, 2559.452649869678, 1761, 7840, 2404.0, 3285.3999999999996, 3606.7999999999975, 4446.040000000001, 0.43280064886255404, 57.036351185835244, 2.141440490568819], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 270, 0, 0.0, 1942.8777777777775, 1525, 3759, 1835.0, 2467.8, 2657.5, 3571.500000000003, 0.10796937988386493, 5.0681462674685465, 0.6552188674291971], "isController": true}, {"data": ["2.5 Select patient", 1081, 0, 0.0, 290.17206290471836, 201, 1416, 241.0, 434.0, 530.0, 880.2800000000029, 0.4303366219650022, 9.920429617818483, 0.2995341063667925], "isController": false}, {"data": ["Get Session ID's", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.3 Search by first/last name", 1081, 0, 0.0, 264.575393154486, 191, 1596, 222.0, 374.4000000000002, 488.6999999999996, 735.1200000000022, 0.4308846648107934, 10.176987694675367, 0.3410069965943769], "isController": false}, {"data": ["Data prep", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["4.0 Vaccination for flu", 270, 0, 0.0, 1900.5296296296287, 1504, 3500, 1794.0, 2348.9, 2623.2499999999995, 3042.1900000000023, 0.1079439123431465, 4.908386711639632, 0.6516067376391227], "isController": true}, {"data": ["4.0 Vaccination for hpv", 270, 0, 0.0, 1952.1037037037029, 1508, 4618, 1792.0, 2573.0, 2855.5999999999995, 4209.900000000001, 0.10850520021218796, 4.70460738636592, 0.6575270710427751], "isController": true}, {"data": ["1.2 Sign-in page", 1151, 0, 0.0, 396.4726324934839, 90, 2796, 342.0, 596.0, 709.3999999999999, 1033.2000000000007, 0.43316778119871185, 8.058646824284606, 0.5664169007268638], "isController": false}, {"data": ["Debug Sampler", 1151, 0, 0.0, 0.41876629018244993, 0, 2, 0.0, 1.0, 1.0, 1.0, 0.43348622730270253, 2.38577781495825, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 695, 8, 1.1510791366906474, 697.0733812949635, 157, 2104, 620.0, 988.4, 1180.1999999999998, 1588.3999999999996, 0.2770477315371605, 6.747918554345006, 0.41019165175458916], "isController": false}, {"data": ["1.4 Open Sessions list", 1151, 0, 0.0, 1288.0582102519545, 839, 4075, 1159.0, 1924.8, 2162.3999999999996, 2703.36, 0.4330471810735431, 32.86379832852159, 0.27986380988306975], "isController": false}, {"data": ["4.2 Vaccination batch", 1081, 0, 0.0, 392.9925994449578, 301, 2330, 340.0, 528.0, 636.3999999999978, 912.7800000000013, 0.4313103375631804, 6.1200274252129425, 0.697748925863698], "isController": false}, {"data": ["1.1 Homepage", 1151, 0, 0.0, 381.06602953953086, 266, 1953, 339.0, 510.79999999999995, 615.7999999999997, 1055.88, 0.4331099173516401, 7.871265197181662, 0.5615685261685314], "isController": false}, {"data": ["1.3 Sign-in", 1151, 0, 0.0, 493.8557775847094, 290, 4602, 422.0, 727.5999999999999, 838.0, 1200.7600000000002, 0.43305402414793515, 8.278644541962596, 0.7350617201923572], "isController": false}, {"data": ["2.2 Session register", 1081, 0, 0.0, 282.0268270120258, 183, 3031, 219.0, 454.2000000000003, 576.2999999999977, 931.5400000000002, 0.4305755652150707, 12.632773583646374, 0.28658840199805385], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 271, 0, 0.0, 1987.3763837638376, 1496, 4433, 1852.0, 2528.8, 2710.3999999999996, 3608.2799999999934, 0.10969910062929233, 5.288667231573183, 0.6654978890766008], "isController": true}, {"data": ["2.1 Open session", 1081, 0, 0.0, 395.6688251618873, 206, 1666, 316.0, 610.4000000000002, 723.6999999999996, 1025.9600000000046, 0.43063028179393964, 7.0087188440385395, 0.2828399845494954], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, 100.0, 0.05707355354212742], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 14017, 8, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 695, 8, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
